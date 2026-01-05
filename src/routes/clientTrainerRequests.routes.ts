import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { trainerChangeRequestController } from '../controllers/users/trainerChangeRequest.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const createRequestSchema = z.object({
  requestedTrainerId: z.string().length(24).nullable().optional(),
  reason: z.string().min(5).max(500)
});

router.use(authMiddleware, roleMiddleware(['client']));

router.post(
  '/trainer-change-requests',
  validateRequest({ body: createRequestSchema }),
  trainerChangeRequestController.createClientRequest
);
router.get('/trainer-change-requests', trainerChangeRequestController.listClientRequests);

export default router;
