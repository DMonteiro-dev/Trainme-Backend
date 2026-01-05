import { Router } from 'express';
import { z } from 'zod';
import { clientController } from '../controllers/users/client.controller.js';

import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const updateClientSchema = z.object({
  age: z.number().int().positive().max(120).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  goals: z.string().optional(),
  medicalRestrictions: z.string().optional(),
  preferences: z.string().optional()
});

router.get('/me', authMiddleware, roleMiddleware(['client']), clientController.getMe);
router.put('/me', authMiddleware, roleMiddleware(['client']), validateRequest({ body: updateClientSchema }), clientController.updateMe);


export default router;
