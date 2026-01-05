import { Response } from 'express';
import { messageService } from '../../services/core/message.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';

import { getIO } from '../../socket/index.js';

export const messageController = {
  send: async (req: AuthenticatedRequest, res: Response) => {
    const message = await messageService.sendMessage({
      senderId: req.user!.id,
      receiverId: req.body.receiverId,
      content: req.body.content
    });

    // Socket emission is handled in messageService

    return sendSuccess({ res, data: message, statusCode: 201 });
  },

  conversationSummaries: async (req: AuthenticatedRequest, res: Response) => {
    const conversations = await messageService.getConversationSummaries(req.user!.id);
    return sendSuccess({ res, data: conversations });
  },

  conversationWithUser: async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    const messages = await messageService.getConversation(req.user!.id, userId);
    return sendSuccess({ res, data: messages });
  },

  markAsRead: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const message = await messageService.markAsRead(id, req.user!.id);
    return sendSuccess({ res, data: message });
  },

  toggleLike: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const message = await messageService.toggleLike(id, req.user!.id);
    return sendSuccess({ res, data: message });
  }
};
