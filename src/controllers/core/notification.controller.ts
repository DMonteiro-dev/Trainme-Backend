import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services/core/notification.service.js';
import { AppError } from '../../utils/appError.js';

export const notificationController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError('Not authenticated', 401);
            // Use _id explicitly and convert to string
            const userId = (req.user._id as any).toString();

            const notifications = await notificationService.listByUser(userId);
            const unreadCount = await notificationService.getUnreadCount(userId);

            res.json({
                notifications,
                unreadCount
            });
        } catch (error) {
            next(error);
        }
    },

    async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError('Not authenticated', 401);
            const { id } = req.params;
            const userId = (req.user._id as any).toString();

            if (!id) throw new AppError('Notification ID is required', 400);

            const updated = await notificationService.markAsRead(id, userId);
            if (!updated) throw new AppError('Notification not found', 404);

            res.json(updated);
        } catch (error) {
            next(error);
        }
    },

    async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError('Not authenticated', 401);
            const userId = (req.user._id as any).toString();

            await notificationService.markAllAsRead(userId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
};
