import { Response } from 'express';
import { reviewService } from '../../services/core/review.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { AppError } from '../../utils/appError.js';

export const reviewController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'client') {
      throw new AppError('Only clients can write reviews', 403);
    }
    const review = await reviewService.create({
      ...req.body,
      authorId: req.user.id
    });
    return sendSuccess({ res, data: review, statusCode: 201 });
  },

  list: async (req: AuthenticatedRequest, res: Response) => {
    const reviews = await reviewService.list({
      trainerId: req.query.trainerId as string,
      authorId: req.query.authorId as string
    });
    return sendSuccess({ res, data: reviews });
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const review = await reviewService.getById(id);
    return sendSuccess({ res, data: review });
  }
};
