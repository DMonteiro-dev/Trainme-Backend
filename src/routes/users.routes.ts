import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { userController } from '../controllers/users/user.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  avatarUrl: z.string().url().optional()
});

import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'trainer', 'client']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional()
});

router.get('/me', authMiddleware, userController.getMe);
router.patch('/me', authMiddleware, validateRequest({ body: updateMeSchema }), userController.updateMe);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.get('/:id', authMiddleware, validateRequest({ params: z.object({ id: z.string().length(24) }) }), userController.getById);
export default router;
