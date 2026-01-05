import { NotificationModel } from '../../models/notification.model.js';
import { Types } from 'mongoose';

export const notificationService = {
    async create(userId: string | Types.ObjectId, type: 'message' | 'session_scheduled' | 'system', title: string, message: string, metadata?: any) {
        return NotificationModel.create({
            userId,
            type,
            title,
            message,
            metadata,
        });
    },

    async listByUser(userId: string) {
        return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
    },

    async getUnreadCount(userId: string) {
        return NotificationModel.countDocuments({ userId, read: false });
    },

    async markAsRead(notificationId: string, userId: string) {
        return NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        );
    },

    async markAllAsRead(userId: string) {
        return NotificationModel.updateMany(
            { userId, read: false },
            { read: true }
        );
    }
};
