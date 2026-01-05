import { Response } from 'express';
import { trainerRelationService } from '../../services/users/trainerRelation.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../types/express/index.js';

export const trainerRelationController = {
  listTrainers: async (_req: AuthenticatedRequest, res: Response) => {
    const trainers = await trainerRelationService.listTrainers();
    return sendSuccess({ res, data: trainers });
  },

  listClients: async (_req: AuthenticatedRequest, res: Response) => {
    const clients = await trainerRelationService.listClients();
    return sendSuccess({ res, data: clients });
  },

  createRelation: async (req: AuthenticatedRequest, res: Response) => {
    const relation = await trainerRelationService.assignTrainer(req.body.clientId, req.body.trainerId ?? null);
    return sendSuccess({ res, data: relation, statusCode: 201 });
  },

  updateRelation: async (req: AuthenticatedRequest, res: Response) => {
    const { clientId } = req.params as { clientId: string };
    const relation = await trainerRelationService.assignTrainer(clientId, req.body.trainerId ?? null);
    return sendSuccess({ res, data: relation });
  }
};
