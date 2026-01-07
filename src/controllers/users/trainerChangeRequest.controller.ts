import { Response } from 'express';
import { trainerChangeRequestService } from '../../services/users/trainerChangeRequest.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';
import { TrainerChangeRequestStatus } from '../../models/trainerChangeRequest.model.js';

export const trainerChangeRequestController = {
  createClientRequest: async (req: AuthenticatedRequest, res: Response) => {
    const request = await trainerChangeRequestService.create(req.user!.id, {
      requestedTrainerId: req.body.requestedTrainerId ?? null,
      reason: req.body.reason
    });
    return sendSuccess({ res, data: request, statusCode: 201 });
  },

  listClientRequests: async (req: AuthenticatedRequest, res: Response) => {
    const requests = await trainerChangeRequestService.listForClient(req.user!.id);
    return sendSuccess({ res, data: requests });
  },

  listAdminRequests: async (req: AuthenticatedRequest, res: Response) => {
    const filters: { status?: TrainerChangeRequestStatus } = {};
    if (req.query.status) {
      filters.status = req.query.status as TrainerChangeRequestStatus;
    }
    const requests = await trainerChangeRequestService.list(filters);
    return sendSuccess({ res, data: requests });
  },

  approveRequest: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    console.log(`[Admin] Approving request ${id} by user ${req.user!.id}`);
    const request = await trainerChangeRequestService.approve(id, req.user!.id);
    return sendSuccess({ res, data: request });
  },

  rejectRequest: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    console.log(`[Admin] Rejecting request ${id} by user ${req.user!.id}`);
    const request = await trainerChangeRequestService.reject(id, req.user!.id);
    return sendSuccess({ res, data: request });
  }
};
