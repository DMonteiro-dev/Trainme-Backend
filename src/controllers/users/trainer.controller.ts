import { Response } from 'express';
import { TrainerFilters, trainerService } from '../../services/users/trainer.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';

export const trainerController = {
  list: async (req: AuthenticatedRequest, res: Response) => {
    const filters: TrainerFilters = {};
    if (req.query.location) filters.location = req.query.location as string;
    if (req.query.specialties) filters.specialties = req.query.specialties as string;
    if (req.query.minRating) filters.minRating = Number(req.query.minRating);
    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);
    const trainers = await trainerService.list(filters);
    return sendSuccess({ res, data: trainers });
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const trainer = await trainerService.getById(id);
    return sendSuccess({ res, data: trainer });
  },

  getMe: async (req: AuthenticatedRequest, res: Response) => {
    const trainer = await trainerService.getById(req.user!.id);
    return sendSuccess({ res, data: trainer });
  },

  updateMe: async (req: AuthenticatedRequest, res: Response) => {
    const profile = await trainerService.updateMyProfile(req.user!.id, req.body);
    return sendSuccess({ res, data: profile });
  },

  listMyClients: async (req: AuthenticatedRequest, res: Response) => {
    const clients = await trainerService.listMyClients(req.user!.id);
    return sendSuccess({ res, data: clients });
  },

  createClient: async (req: AuthenticatedRequest, res: Response) => {
    const client = await trainerService.createClient(req.user!.id, req.body);
    return sendSuccess({ res, data: client, statusCode: 201 });
  },

  getUnassignedClients: async (req: AuthenticatedRequest, res: Response) => {
    const clients = await trainerService.getUnassignedClients();
    return sendSuccess({ res, data: clients });
  },

  assignClient: async (req: AuthenticatedRequest, res: Response) => {
    const { clientId } = req.params as { clientId: string };
    const client = await trainerService.assignClient(req.user!.id, clientId);
    return sendSuccess({ res, data: client });
  }
};
