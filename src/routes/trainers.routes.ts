import { Router } from 'express';
import { z } from 'zod';
import { trainerController } from '../controllers/users/trainer.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const updateTrainerSchema = z.object({
  bio: z.string().max(500).optional(),
  specialties: z.array(z.string()).optional(),
  yearsOfExperience: z.number().int().nonnegative().optional(),
  pricePerSession: z.number().nonnegative().optional(),
  location: z.string().optional(),
  onlineSessionsAvailable: z.boolean().optional(),
  socialLinks: z.array(z.string().url()).optional()
});

router.get('/', trainerController.list);
router.get('/me', authMiddleware, roleMiddleware(['trainer']), trainerController.getMe);
router.put('/me', authMiddleware, roleMiddleware(['trainer']), validateRequest({ body: updateTrainerSchema }), trainerController.updateMe);
router.get('/me/clients', authMiddleware, roleMiddleware(['trainer']), trainerController.listMyClients);
router.post('/clients', authMiddleware, roleMiddleware(['trainer']), validateRequest({ body: z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6) }) }), trainerController.createClient);
router.get('/clients/unassigned', authMiddleware, roleMiddleware(['trainer']), trainerController.getUnassignedClients);
router.post('/clients/:clientId/assign', authMiddleware, roleMiddleware(['trainer']), validateRequest({ params: z.object({ clientId: z.string().length(24) }) }), trainerController.assignClient);

router.get('/:id', validateRequest({ params: z.object({ id: z.string().length(24) }) }), trainerController.getById);

export default router;
