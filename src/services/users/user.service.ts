import { FilterQuery } from 'mongoose';
import { UserModel, IUser, UserRole } from '../../models/user.model.js';
import { TrainerProfileModel } from '../../models/trainerProfile.model.js';
import { ClientProfileModel } from '../../models/clientProfile.model.js';
import { AppError } from '../../utils/appError.js';

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async updateCurrentUser(userId: string, payload: Partial<IUser>) {
    // If password is being updated, we need to use save() to trigger the pre-save hook for hashing
    if (payload.password) {
      const user = await UserModel.findById(userId);
      if (!user) throw new AppError('User not found', 404);

      user.password = payload.password;
      if (payload.name) user.name = payload.name;
      if (payload.email) user.email = payload.email;
      if (payload.avatarUrl) user.avatarUrl = payload.avatarUrl;

      await user.save();
      return user.toObject({ transform: (_doc, ret) => { delete (ret as any).password; return ret; } });
    }

    // For other updates, findByIdAndUpdate is more efficient
    const user = await UserModel.findByIdAndUpdate(userId, payload, { new: true }).select('-password');
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select('name email role avatarUrl status createdAt');
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async listUsers(filters: { role?: UserRole; status?: string }) {
    const query: FilterQuery<IUser> = {};
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status as IUser['status'];
    return UserModel.find(query).select('-password');
  },

  async updateStatus(userId: string, status: IUser['status']) {
    const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async updateRole(userId: string, newRole: UserRole) {
    const user = await UserModel.findByIdAndUpdate(userId, { role: newRole }, { new: true }).select('-password');
    if (!user) throw new AppError('User not found', 404);

    if (newRole === 'trainer') {
      const existingProfile = await TrainerProfileModel.findOne({ userId: user._id });
      if (!existingProfile) {
        await TrainerProfileModel.create({ userId: user._id, specialties: [] });
      }
    } else if (newRole === 'client') {
      const existingProfile = await ClientProfileModel.findOne({ userId: user._id });
      if (!existingProfile) {
        await ClientProfileModel.create({ userId: user._id });
      }
    }

    return user;
  },

  async createUserByAdmin(payload: { name: string; email: string; password: string; role: UserRole }) {
    const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }
    const user = await UserModel.create(payload);
    if (payload.role === 'trainer') {
      await TrainerProfileModel.create({ userId: user._id, specialties: [] });
    }
    if (payload.role === 'client') {
      await ClientProfileModel.create({ userId: user._id });
    }
    return user;
  },

  async adminUpdateUser(userId: string, payload: { name?: string; email?: string; role?: UserRole; status?: string }) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.status) user.status = payload.status as any;

    if (payload.role && payload.role !== user.role) {
      user.role = payload.role;
      if (payload.role === 'trainer') {
        const existingProfile = await TrainerProfileModel.findOne({ userId: user._id });
        if (!existingProfile) {
          await TrainerProfileModel.create({ userId: user._id, specialties: [] });
        }
      } else if (payload.role === 'client') {
        const existingProfile = await ClientProfileModel.findOne({ userId: user._id });
        if (!existingProfile) {
          await ClientProfileModel.create({ userId: user._id });
        }
      }
    }

    await user.save();
    return user;
  }
};
