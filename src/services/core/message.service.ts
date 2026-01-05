import { MessageModel } from '../../models/message.model.js';
import { UserModel } from '../../models/user.model.js';
import { getIO } from '../../socket/index.js';
import { notificationService } from './notification.service.js';

export const messageService = {
  async sendMessage(data: { senderId: string; receiverId: string; content: string }) {
    const sender = await UserModel.findById(data.senderId);
    if (!sender) throw new Error('Sender not found');

    // 1. Handle Admin Broadcast
    if (data.receiverId === 'ALL') {
      if (sender.role !== 'admin') {
        throw new Error('Only admins can broadcast messages');
      }

      const users = await UserModel.find({ _id: { $ne: data.senderId } });

      if (users.length === 0) {
        throw new Error('No users to broadcast to');
      }

      const messages = await Promise.all(
        users.map((user) =>
          MessageModel.create({
            senderId: data.senderId,
            receiverId: user._id,
            content: data.content
          })
        )
      );

      try {
        const io = getIO();

        messages.forEach((msg) => {
          io.to(msg.receiverId.toString()).emit('receive_message', msg);
        });

      } catch (error) {
        console.error('Socket emit failed:', error);
      }

      return messages[0]; // Return one for response
    }

    // 2. Handle 1-on-1 Permission Checks
    const receiver = await UserModel.findById(data.receiverId);
    if (!receiver) throw new Error('Receiver not found');

    // Admin can talk to anyone
    if (sender.role === 'admin') {
      // Allowed
    }
    // Trainer can only talk to their clients
    else if (sender.role === 'trainer') {
      if (receiver.role === 'client' && receiver.trainerId?.toString() !== sender._id.toString()) {
        throw new Error('You can only message your assigned clients');
      }
      // Trainer to Admin? Usually allowed for support. Let's allow it.
      // Trainer to other Trainer? Maybe not.
    }
    // Client can only talk to their trainer
    else if (sender.role === 'client') {
      if (receiver.role === 'trainer' && sender.trainerId?.toString() !== receiver._id.toString()) {
        throw new Error('You can only message your assigned trainer');
      }
      // Client to Admin? Allowed.
    }

    const message = await MessageModel.create(data);

    // Create persistent notification
    try {
      if (data.senderId !== data.receiverId) {
        await notificationService.create(
          data.receiverId,
          'message',
          `Nova mensagem de ${sender.name}`,
          message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          { senderId: data.senderId, messageId: message._id }
        );
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    const io = getIO();
    try {
      const room = data.receiverId.toString();
      io.to(room).emit('receive_message', message);
    } catch (error) {
      console.error('Socket emit failed:', error);
    }

    return message;
  },

  async getConversation(userId: string, otherUserId: string) {
    const messages = await MessageModel.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatarUrl')
      .lean();

    // Check permission to send new messages
    const sender = await UserModel.findById(userId);
    const receiver = await UserModel.findById(otherUserId);
    let canSendMessage = false;

    if (sender && receiver) {
      if (sender.role === 'admin') {
        canSendMessage = true;
      } else if (sender.role === 'trainer') {
        if (receiver.role === 'client' && receiver.trainerId?.toString() === sender._id.toString()) {
          canSendMessage = true;
        } else if (receiver.role === 'admin') {
          canSendMessage = true;
        }
      } else if (sender.role === 'client') {
        if (receiver.role === 'trainer' && sender.trainerId?.toString() === receiver._id.toString()) {
          canSendMessage = true;
        } else if (receiver.role === 'admin') {
          canSendMessage = true;
        }
      }
    }

    return { messages, canSendMessage };
  },

  async getConversationSummaries(userId: string) {
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .sort({ createdAt: -1 })
      .lean();

    const summaries: Record<string, { lastMessage: typeof messages[number]; unreadCount: number }> = {};

    messages.forEach((message) => {
      const otherUserId = message.senderId.toString() === userId ? message.receiverId.toString() : message.senderId.toString();

      if (!summaries[otherUserId]) {
        summaries[otherUserId] = { lastMessage: message, unreadCount: 0 };
      }

      if (message.receiverId.toString() === userId && !message.read) {
        summaries[otherUserId].unreadCount++;
      }
    });

    const otherUserIds = Object.keys(summaries);
    const users = await UserModel.find({ _id: { $in: otherUserIds } }).lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return Object.entries(summaries).map(([otherUserId, { lastMessage, unreadCount }]) => {
      const user = userMap.get(otherUserId);
      return {
        userId: otherUserId,
        userName: user?.name || 'Unknown User',
        userAvatar: user?.avatarUrl,
        lastMessage: lastMessage.content,
        lastMessageAt: lastMessage.createdAt,
        unreadCount
      };
    });
  },

  async markAsRead(messageId: string, userId: string) {
    const message = await MessageModel.findOneAndUpdate(
      { _id: messageId, receiverId: userId },
      { read: true },
      { new: true }
    );
    return message;
  },

  async toggleLike(messageId: string, userId: string) {
    const message = await MessageModel.findById(messageId);
    if (!message) throw new Error('Message not found');

    const likeIndex = message.likes.indexOf(userId);
    if (likeIndex === -1) {
      message.likes.push(userId);
    } else {
      message.likes.splice(likeIndex, 1);
    }

    await message.save();

    try {
      const io = getIO();
      // Emit update to both sender and receiver
      io.to(message.senderId.toString()).emit('message_updated', message);
      io.to(message.receiverId.toString()).emit('message_updated', message);
    } catch (error) {
      console.error('Socket emit failed:', error);
    }

    return message;
  }
};
