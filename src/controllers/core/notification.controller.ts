import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../../services/core/notification.service.js';
import { AppError } from '../../utils/appError.js';

export const notificationController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError('Not authenticated', 401);
            const notifications = await notificationService.listByUser(req.user.id);
            const unreadCount = await notificationService.getUnreadCount(req.user.id);

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

            const updated = await notificationService.markAsRead(id, req.user.id);
            if (!updated) throw new AppError('Notification not found', 404);

            res.json(updated);
        } catch (error) {
            next(error);
        }
    },

    async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError('Not authenticated', 401);

            await notificationService.markAllAsRead(req.user.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
};
