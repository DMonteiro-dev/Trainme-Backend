import { ReviewModel, IReview } from '../../models/review.model.js';
import { AppError } from '../../utils/appError.js';

export const reviewService = {
  async create(data: Partial<IReview>) {
    return ReviewModel.create(data);
  },

  async list(filters: { trainerId?: string; authorId?: string }) {
    const query: Record<string, unknown> = {};
    if (filters.trainerId) query.trainerId = filters.trainerId;
    if (filters.authorId) query.authorId = filters.authorId;
    return ReviewModel.find(query).sort({ createdAt: -1 });
  },

  async getById(id: string) {
    const review = await ReviewModel.findById(id);
    if (!review) throw new AppError('Review not found', 404);
    return review;
  }
};
