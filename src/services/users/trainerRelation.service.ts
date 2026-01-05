import { Types } from 'mongoose';
import { IUser, UserModel } from '../../models/user.model.js';
import { AppError } from '../../utils/appError.js';

const mapUserSummary = (user?: Pick<IUser, 'name' | 'email' | 'role' | 'avatarUrl'> & { _id: Types.ObjectId } | null) => {
  if (!user?._id) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role
  };
};

const mapClientWithTrainer = (client: IUser & { trainerId?: Types.ObjectId | IUser | null }) => {
  const trainerRef = client.trainerId as (IUser & { _id: Types.ObjectId }) | Types.ObjectId | null | undefined;
  const trainer =
    trainerRef && !(trainerRef instanceof Types.ObjectId) ? mapUserSummary(trainerRef as IUser & { _id: Types.ObjectId }) : null;
  const trainerId =
    trainerRef instanceof Types.ObjectId
      ? trainerRef.toString()
      : trainerRef && trainerRef._id
        ? trainerRef._id.toString()
        : null;

  return {
    id: client._id.toString(),
    name: client.name,
    email: client.email,
    status: client.status,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    trainerId,
    trainer
  };
};

export const trainerRelationService = {
  async listTrainers() {
    const trainers = await UserModel.find({ role: 'trainer' }).select('name email role status createdAt updatedAt avatarUrl').lean();
    const counts = await UserModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { role: 'client', trainerId: { $ne: null } } },
      { $group: { _id: '$trainerId', count: { $sum: 1 } } }
    ]);
    const countMap = new Map<string, number>();
    counts.forEach((entry) => {
      if (entry?._id) {
        countMap.set(entry._id.toString(), entry.count);
      }
    });

    return trainers.map((trainer) => ({
      id: trainer._id.toString(),
      name: trainer.name,
      email: trainer.email,
      avatarUrl: trainer.avatarUrl,
      role: trainer.role,
      status: trainer.status,
      createdAt: trainer.createdAt,
      updatedAt: trainer.updatedAt,
      clientCount: countMap.get(trainer._id.toString()) ?? 0
    }));
  },

  async listClients() {
    const clients = await UserModel.find({ role: 'client' })
      .select('name email role status trainerId createdAt updatedAt avatarUrl')
      .populate('trainerId', 'name email role avatarUrl');

    return clients.map((client) => mapClientWithTrainer(client));
  },

  async assignTrainer(clientId: string, trainerId: string | null) {
    const client = await UserModel.findOne({ _id: clientId, role: 'client' }).populate('trainerId', 'name email role avatarUrl');
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    let trainerRef: Types.ObjectId | null = null;
    if (trainerId) {
      const trainer = await UserModel.findOne({ _id: trainerId, role: 'trainer' });
      if (!trainer) {
        throw new AppError('Trainer not found', 404);
      }
      trainerRef = trainer._id;
    }

    client.trainerId = trainerRef;
    await client.save();
    await client.populate('trainerId', 'name email role avatarUrl');

    return mapClientWithTrainer(client);
  }
};
