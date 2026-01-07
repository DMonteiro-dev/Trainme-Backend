import crypto from 'crypto';

import { UserModel, IUser } from '../../models/user.model.js';
import { ClientProfileModel } from '../../models/clientProfile.model.js';
import { TrainerProfileModel } from '../../models/trainerProfile.model.js';
import { AppError } from '../../utils/appError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateMagicLinkToken, verifyAccessToken } from '../../utils/token.js';
import { sendEmail } from '../email/email.service.js';

export const authService = {
  async registerUser(payload: { name: string; email: string; password: string; role?: 'client' | 'trainer' }) {
    const existing = await UserModel.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const role = payload.role ?? 'client';
    const user = await UserModel.create({ ...payload, role });

    if (role === 'client') {
      await ClientProfileModel.create({ userId: user._id });
    } else if (role === 'trainer') {
      await TrainerProfileModel.create({ userId: user._id });
    }

    return user;
  },

  async login(payload: { email: string; password: string }) {
    const user = await UserModel.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      console.log(`Login failed: User not found for email ${payload.email}`);
      throw new AppError('Invalid credentials (User not found)', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account inactive', 403);
    }

    const isMatch = await user.comparePassword(payload.password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for user ${payload.email}`);
      throw new AppError('Invalid credentials (Password mismatch)', 401);
    }

    const tokens = authService.generateTokens(user);
    return { user, ...tokens };
  },

  generateTokens(user: IUser) {
    return {
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user)
    };
  },

  async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }
    return authService.generateTokens(user);
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new AppError('Old password does not match', 400);

    user.password = newPassword;
    await user.save();
    return true;
  },



  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetURL = `${clientUrl}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Recuperação de Senha - TrainMe',
      html: `
        <h1>Recuperação de Senha</h1>
        <p>Recebemos um pedido para redefinir a sua senha.</p>
        <p>Clique no link abaixo para definir uma nova senha:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>Este link expira em 10 minutos.</p>
        <p>Se não pediu esta alteração, ignore este email.</p>
      `
    });

    return { message: 'Token sent to email!' };
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const tokens = authService.generateTokens(user);
    return { user, ...tokens };
  },

  async generateMagicLink(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const token = generateMagicLinkToken(user);
    return { token };
  },

  async loginWithMagicLink(token: string) {
    try {
      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub);
      if (!user) throw new AppError('User not found', 404);

      const tokens = authService.generateTokens(user);
      return { user, ...tokens };
    } catch (error) {
      throw new AppError('Invalid or expired magic link', 401);
      throw new AppError('Invalid or expired magic link', 401);
    }
  },

  async loginWithQr(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('Invalid QR Code (User not found)', 404);
    }

    if (user.status !== 'active') {
      throw new AppError('Account inactive', 403);
    }

    const tokens = authService.generateTokens(user);
    return { user, ...tokens };
  }
};
