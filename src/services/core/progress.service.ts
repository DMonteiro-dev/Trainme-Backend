import { FilterQuery } from 'mongoose';
import { ProgressLogModel, IProgressLog } from '../../models/progressLog.model.js';
import { AppError } from '../../utils/appError.js';

export const progressService = {
  async create(data: Partial<IProgressLog>) {
    return ProgressLogModel.create(data);
  },

  async list(filters: { clientId?: string; from?: string; to?: string }) {
    const query: FilterQuery<IProgressLog> = {};
    if (filters.clientId) query.clientId = filters.clientId as unknown as IProgressLog['clientId'];
    if (filters.from || filters.to) {
      query.date = {} as Record<string, Date>;
      if (filters.from) (query.date as Record<string, Date>).$gte = new Date(filters.from);
      if (filters.to) (query.date as Record<string, Date>).$lte = new Date(filters.to);
    }
    return ProgressLogModel.find(query).sort({ date: -1 });
  },

  async getById(id: string) {
    const log = await ProgressLogModel.findById(id);
    if (!log) throw new AppError('Progress log not found', 404);
    return log;
  },

  async update(id: string, payload: Partial<IProgressLog>) {
    const log = await ProgressLogModel.findByIdAndUpdate(id, payload, { new: true });
    if (!log) throw new AppError('Progress log not found', 404);
    return log;
  },

  async delete(id: string) {
    const log = await ProgressLogModel.findByIdAndDelete(id);
    if (!log) throw new AppError('Progress log not found', 404);
    return true;
  }
};
