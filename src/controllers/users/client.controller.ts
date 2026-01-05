import { Response } from 'express';
import { clientService } from '../../services/users/client.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';

export const clientController = {
  getMe: async (req: AuthenticatedRequest, res: Response) => {
    const profile = await clientService.getMyProfile(req.user!.id);
    return sendSuccess({ res, data: profile });
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    const profile = await clientService.updateMyProfile(req.user!.id, req.body);
    return sendSuccess({ res, data: profile });
  }
};
