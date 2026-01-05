import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { reviewController } from '../controllers/core/review.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const createSchema = z.object({
  trainerId: z.string().length(24),
  workoutPlanId: z.string().length(24).optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

router.post('/', authMiddleware, validateRequest({ body: createSchema }), reviewController.create);
router.get('/', authMiddleware, reviewController.list);
router.get('/:id', authMiddleware, validateRequest({ params: z.object({ id: z.string().length(24) }) }), reviewController.getById);

export default router;
