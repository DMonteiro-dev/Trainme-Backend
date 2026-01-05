import { Response } from 'express';
import { authService } from '../../services/auth/auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { IUser } from '../../models/user.model.js';

const sanitizeUser = (user: IUser) => {
  const data = user.toObject();
  delete (data as { password?: string }).password;
  return data;
};

export const authController = {
  register: async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.registerUser(req.body);
    const tokens = authService.generateTokens(user);
    return sendSuccess({ res, data: { user: sanitizeUser(user), ...tokens }, statusCode: 201 });
  },

  login: async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.login(req.body);
    const { user, accessToken, refreshToken } = result;
    return sendSuccess({
      res,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      }
    });
  },

  refresh: async (req: AuthenticatedRequest, res: Response) => {
    const tokens = await authService.refresh(req.body.refreshToken);
    return sendSuccess({ res, data: tokens });
  },

  changePassword: async (req: AuthenticatedRequest, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
    return sendSuccess({ res, data: null, message: 'Password updated' });
  },

  forgotPassword: async (req: AuthenticatedRequest, res: Response) => {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess({ res, data: result, message: 'Reset link sent (mocked)' });
  },

  resetPassword: async (req: AuthenticatedRequest, res: Response) => {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    const { user, accessToken, refreshToken } = result;
    return sendSuccess({
      res,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      },
      message: 'Password reset successful'
    });
  },

  generateMagicLink: async (req: AuthenticatedRequest, res: Response) => {
    const { token } = await authService.generateMagicLink(req.user!.id);
    return sendSuccess({ res, data: { token } });
  },

  loginWithMagicLink: async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.body;
    const result = await authService.loginWithMagicLink(token);
    const { user, accessToken, refreshToken } = result;
    return sendSuccess({
      res,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      }
    });
  },

  loginWithQr: async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.body;
    const result = await authService.loginWithQr(userId);
    const { user, accessToken, refreshToken } = result;
    return sendSuccess({
      res,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      }
    });
  }
};
