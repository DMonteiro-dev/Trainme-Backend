import { Response } from 'express';
import { userService } from '../../services/users/user.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { IUser } from '../../models/user.model.js';

const toAdminUserDTO = (user: IUser) => {
  const data = user.toObject();
  return {
    ...data,
    id: user._id.toString(),
    password: undefined,
    __v: undefined
  };
};

export const userController = {
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.getCurrentUser(req.user!.id);
    return sendSuccess({ res, data: user });
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.updateCurrentUser(req.user!.id, req.body);
    return sendSuccess({ res, data: user });
  },

  uploadAvatar: async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      return sendSuccess({ res, data: null, message: 'No file uploaded', statusCode: 400 });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await userService.updateCurrentUser(req.user!.id, { avatarUrl });
    return sendSuccess({ res, data: { user, avatarUrl } });
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.getUserById(id);
    return sendSuccess({ res, data: user });
  },

  adminListUsers: async (req: AuthenticatedRequest, res: Response) => {
    const filters: { role?: 'admin' | 'trainer' | 'client'; status?: string } = {};
    if (req.query.role) filters.role = req.query.role as 'admin' | 'trainer' | 'client';
    if (req.query.status) filters.status = req.query.status as string;
    const users = await userService.listUsers(filters);
    return sendSuccess({ res, data: users.map(toAdminUserDTO) });
  },

  adminUpdateStatus: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.updateStatus(id, req.body.status);
    return sendSuccess({ res, data: toAdminUserDTO(user) });
  },

  adminUpdateRole: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.updateRole(id, req.body.role);
    return sendSuccess({ res, data: toAdminUserDTO(user) });
  },

  adminCreateUser: async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.createUserByAdmin(req.body);
    return sendSuccess({ res, data: toAdminUserDTO(user), statusCode: 201 });
  },

  adminGetUserById: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.getUserById(id);
    return sendSuccess({ res, data: toAdminUserDTO(user) });
  },

  adminUpdateUser: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.adminUpdateUser(id, req.body);
    return sendSuccess({ res, data: toAdminUserDTO(user) });
  }
};
