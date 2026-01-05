import { FilterQuery } from 'mongoose';
import { ITrainerProfile, TrainerProfileModel } from '../../models/trainerProfile.model.js';
import { AppError } from '../../utils/appError.js';
import { ClientProfileModel } from '../../models/clientProfile.model.js';
import { UserModel } from '../../models/user.model.js';

export interface TrainerFilters {
  location?: string;
  specialties?: string;
  minRating?: number;
  maxPrice?: number;
}

export const trainerService = {
  async list(filters: TrainerFilters = {}) {
    const query: FilterQuery<ITrainerProfile> = {};
    if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
    if (filters.specialties) query.specialties = { $in: filters.specialties.split(',') };
    if (filters.minRating) query.ratingAverage = { $gte: filters.minRating };
    if (filters.maxPrice) query.pricePerSession = { $lte: filters.maxPrice };

    return TrainerProfileModel.find(query).populate('userId', 'name email avatarUrl role');
  },

  async getById(trainerId: string) {
    const profile = await TrainerProfileModel.findOne({ userId: trainerId }).populate(
      'userId',
      'name email avatarUrl role createdAt'
    );
    if (!profile) throw new AppError('Trainer profile not found', 404);
    return profile;
  },

  async updateMyProfile(userId: string, payload: Partial<{ bio: string; specialties: string[]; yearsOfExperience: number; pricePerSession: number; location: string; onlineSessionsAvailable: boolean; socialLinks: string[] }>) {
    const profile = await TrainerProfileModel.findOneAndUpdate({ userId }, payload, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
    return profile;
  },

  async listMyClients(trainerId: string) {
    const clientUsers = await UserModel.find({ role: 'client', trainerId }).select('name email status createdAt').lean();
    if (!clientUsers.length) return [];

    const clientIds = clientUsers.map((client) => client._id);
    const profiles = await ClientProfileModel.find({ userId: { $in: clientIds } }).lean();
    const profileMap = new Map<string, (typeof profiles)[number]>();
    profiles.forEach((profile) => profileMap.set(profile.userId.toString(), profile));

    return clientUsers.map((client) => {
      const profile = profileMap.get(client._id.toString());
      return {
        id: client._id.toString(),
        userId: client._id.toString(),
        name: client.name,
        email: client.email,
        status: client.status,
        goal: profile?.goals,
        height: profile?.height,
        weight: profile?.weight,
        preferences: profile?.preferences,
        createdAt: client.createdAt
      };
    });
  },

  async createClient(trainerId: string, payload: { name: string; email: string; password: string }) {
    const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const user = await UserModel.create({
      ...payload,
      role: 'client',
      trainerId
    });

    await ClientProfileModel.create({
      userId: user._id
    });

    return user;
  },

  async getUnassignedClients() {
    return UserModel.find({
      role: 'client',
      $or: [{ trainerId: null }, { trainerId: { $exists: false } }]
    }).select('name email avatarUrl createdAt');
  },

  async assignClient(trainerId: string, clientId: string) {
    const client = await UserModel.findOne({ _id: clientId, role: 'client' });
    if (!client) {
      throw new AppError('Client not found', 404);
    }

    if (client.trainerId) {
      throw new AppError('Client already assigned to a trainer', 400);
    }

    client.trainerId = new Object(trainerId) as any;
    await client.save();

    return client;
  }
};
