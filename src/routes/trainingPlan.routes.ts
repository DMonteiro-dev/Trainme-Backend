import { Router } from 'express';
import { trainingPlanController } from '../controllers/training/trainingPlan.controller.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    authorize('trainer'),
    trainingPlanController.create
);

router.get(
    '/',
    trainingPlanController.list
);

router.get(
    '/:id',
    trainingPlanController.getById
);

router.put(
    '/:id',
    authorize('trainer'),
    trainingPlanController.update
);

router.delete(
    '/:id',
    authorize('trainer', 'admin'),
    trainingPlanController.delete
);

export default router;
