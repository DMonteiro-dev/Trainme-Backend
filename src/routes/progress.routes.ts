import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { progressController } from '../controllers/core/progress.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const logSchema = z.object({
  clientId: z.string().length(24).optional(),
  trainerId: z.string().length(24).optional(),
  date: z.coerce.date().optional(),
  weight: z.number().positive().optional(),
  bodyFatPercent: z.number().min(0).max(100).optional(),
  measurements: z.record(z.number()).optional(),
  notes: z.string().optional(),
  workoutPlanId: z.string().length(24).optional()
});

router.use(authMiddleware);

router.post('/', validateRequest({ body: logSchema }), progressController.create);
router.get('/', progressController.list);
router.get('/:id', validateRequest({ params: z.object({ id: z.string().length(24) }) }), progressController.getById);
router.put('/:id', validateRequest({ params: z.object({ id: z.string().length(24) }), body: logSchema.partial() }), progressController.update);
router.delete('/:id', validateRequest({ params: z.object({ id: z.string().length(24) }) }), progressController.remove);

export default router;
