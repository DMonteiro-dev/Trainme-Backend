import { Response } from 'express';
import { progressService } from '../../services/core/progress.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { AppError } from '../../utils/appError.js';

export const progressController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    const payload = { ...req.body };
    if (req.user?.role === 'client') {
      payload.clientId = req.user.id;
    }
    if (!payload.clientId) {
      throw new AppError('clientId is required', 400);
    }
    const log = await progressService.create(payload);
    return sendSuccess({ res, data: log, statusCode: 201 });
  },

  list: async (req: AuthenticatedRequest, res: Response) => {
    const filters = {
      clientId: req.user?.role === 'client' ? req.user.id : (req.query.clientId as string),
      from: req.query.from as string,
      to: req.query.to as string
    };
    const logs = await progressService.list(filters);
    return sendSuccess({ res, data: logs });
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const log = await progressService.getById(id);
    if (req.user?.role === 'client' && log.clientId.toString() !== req.user.id) {
      throw new AppError('Not allowed', 403);
    }
    return sendSuccess({ res, data: log });
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const log = await progressService.getById(id);
    if (req.user?.role === 'client' && log.clientId.toString() !== req.user.id) {
      throw new AppError('Not allowed', 403);
    }
    const updated = await progressService.update(id, req.body);
    return sendSuccess({ res, data: updated });
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const log = await progressService.getById(id);
    if (req.user?.role === 'client' && log.clientId.toString() !== req.user.id) {
      throw new AppError('Not allowed', 403);
    }
    await progressService.delete(id);
    return sendSuccess({ res, data: null, message: 'Deleted' });
  }
};
