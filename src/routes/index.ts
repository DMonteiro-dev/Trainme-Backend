import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import adminRoutes from './admin.routes.js';
import trainerRoutes from './trainers.routes.js';
import clientRoutes from './clients.routes.js';
import progressRoutes from './progress.routes.js';
import messageRoutes from './messages.routes.js';
import reviewRoutes from './reviews.routes.js';
import clientTrainerRequestRoutes from './clientTrainerRequests.routes.js';
import trainingPlanRoutes from './trainingPlan.routes.js';
import sessionRoutes from './sessions.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/trainers', trainerRoutes);
router.use('/clients', clientRoutes);
router.use('/progress-logs', progressRoutes);
router.use('/messages', messageRoutes);
router.use('/reviews', reviewRoutes);
router.use('/client', clientTrainerRequestRoutes);
router.use('/plans', trainingPlanRoutes);
router.use('/sessions', sessionRoutes);

export default router;
