import { ClientProfileModel } from '../../models/clientProfile.model.js';
import { AppError } from '../../utils/appError.js';
import { IUser, UserModel } from '../../models/user.model.js';
import { Types } from 'mongoose';

export const clientService = {
  async getMyProfile(userId: string) {
    const profile = await ClientProfileModel.findOne({ userId });
    if (!profile) throw new AppError('Client profile not found', 404);

    const user = await UserModel.findById(userId).populate('trainerId', 'name email role');
    const trainerDoc = user?.trainerId as (IUser & { _id: Types.ObjectId }) | null | undefined;

    return {
      ...profile.toObject(),
      trainerId: trainerDoc ? trainerDoc._id.toString() : null,
      trainer: trainerDoc
        ? {
            id: trainerDoc._id.toString(),
            name: trainerDoc.name,
            email: trainerDoc.email
          }
        : null
    };
  },

  async updateMyProfile(userId: string, payload: Record<string, unknown>) {
    const profile = await ClientProfileModel.findOneAndUpdate({ userId }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    return profile;
  }
};
