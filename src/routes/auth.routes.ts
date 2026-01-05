import { Router } from 'express';
import { z } from 'zod';
import { authController } from '../controllers/auth/auth.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'trainer']).default('client').optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6)
});

const forgotSchema = z.object({
  email: z.string().email()
});

const magicLoginSchema = z.object({
  token: z.string().min(10)
});

const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
});

router.post('/register', validateRequest({ body: registerSchema }), authController.register);
router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.post('/refresh', validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/change-password', authMiddleware, validateRequest({ body: changePasswordSchema }), authController.changePassword);
router.post('/forgot-password', validateRequest({ body: forgotSchema }), authController.forgotPassword);
router.post('/reset-password', validateRequest({ body: resetSchema }), authController.resetPassword);
router.post('/magic-link', authMiddleware, authController.generateMagicLink);
router.post('/magic-login', validateRequest({ body: magicLoginSchema }), authController.loginWithMagicLink);
router.post('/qr-login', validateRequest({ body: z.object({ userId: z.string() }) }), authController.loginWithQr);

export default router;
