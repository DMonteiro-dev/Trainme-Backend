import { FilterQuery, Types } from 'mongoose';
import {
  ITrainerChangeRequest,
  TrainerChangeRequestModel,
  TrainerChangeRequestStatus
} from '../../models/trainerChangeRequest.model.js';
import { IUser, UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/appError.js';

const populatePaths = ['clientId', 'currentTrainerId', 'requestedTrainerId', 'processedBy'];

const toUserSummary = (user: unknown) => {
  if (!user) return null;
  if (user instanceof Types.ObjectId) {
    return { id: user.toString() };
  }
  if (typeof user === 'object' && '_id' in user) {
    const casted = user as IUser & { _id: Types.ObjectId };
    return {
      id: casted._id.toString(),
      name: casted.name,
      email: casted.email,
      role: casted.role
    };
  }
  return null;
};

const mapRequest = (request: ITrainerChangeRequest) => ({
  id: (request._id as Types.ObjectId).toString(),
  client: toUserSummary(request.clientId),
  currentTrainer: toUserSummary(request.currentTrainerId),
  requestedTrainer: toUserSummary(request.requestedTrainerId),
  reason: request.reason,
  status: request.status,
  processedBy: toUserSummary(request.processedBy),
  createdAt: request.createdAt,
  updatedAt: request.updatedAt
});

export const trainerChangeRequestService = {
  async create(clientId: string, payload: { requestedTrainerId?: string | null; reason: string }) {
    const client = await UserModel.findOne({ _id: clientId, role: 'client' });
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (payload.requestedTrainerId) {
      const trainer = await UserModel.findOne({ _id: payload.requestedTrainerId, role: 'trainer' });
      if (!trainer) {
        throw new AppError('Requested trainer not found', 404);
      }
    }

    const pending = await TrainerChangeRequestModel.findOne({ clientId, status: 'pending' });
    if (pending) {
      throw new AppError('There is already a pending request', 409);
    }

    const request = await TrainerChangeRequestModel.create({
      clientId,
      currentTrainerId: client.trainerId ?? null,
      requestedTrainerId: payload.requestedTrainerId ?? null,
      reason: payload.reason,
      status: 'pending'
    });

    await request.populate(populatePaths);
    return mapRequest(request);
  },

  async list(filters: { status?: TrainerChangeRequestStatus } = {}) {
    const query: FilterQuery<ITrainerChangeRequest> = {};
    if (filters.status) query.status = filters.status;

    const requests = await TrainerChangeRequestModel.find(query)
      .sort({ createdAt: -1 })
      .populate(populatePaths);
    return requests.map((request) => mapRequest(request));
  },

  async listForClient(clientId: string) {
    const requests = await TrainerChangeRequestModel.find({ clientId }).sort({ createdAt: -1 }).populate(populatePaths);
    return requests.map((request) => mapRequest(request));
  },

  async approve(requestId: string, adminId: string) {
    const request = await TrainerChangeRequestModel.findById(requestId);
    if (!request) throw new AppError('Request not found', 404);
    if (request.status !== 'pending') throw new AppError('Request already processed', 400);

    const client = await UserModel.findOne({ _id: request.clientId, role: 'client' });
    if (!client) throw new AppError('Client not found', 404);

    let newTrainerId: Types.ObjectId | null = null;
    if (request.requestedTrainerId) {
      const trainerExists = await UserModel.findOne({ _id: request.requestedTrainerId, role: 'trainer' });
      if (!trainerExists) throw new AppError('Requested trainer not found', 404);
      newTrainerId = trainerExists._id;
    }

    client.trainerId = newTrainerId;
    await client.save();

    request.status = 'approved';
    request.processedBy = new Types.ObjectId(adminId);
    await request.save();
    await request.populate(populatePaths);
    return mapRequest(request);
  },

  async reject(requestId: string, adminId: string) {
    const request = await TrainerChangeRequestModel.findById(requestId);
    if (!request) throw new AppError('Request not found', 404);
    if (request.status !== 'pending') throw new AppError('Request already processed', 400);

    request.status = 'rejected';
    request.processedBy = new Types.ObjectId(adminId);
    await request.save();
    await request.populate(populatePaths);
    return mapRequest(request);
  }
};
