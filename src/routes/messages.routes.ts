import { Router } from 'express';
import { z } from 'zod';
import { messageController } from '../controllers/core/message.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const sendSchema = z.object({
  receiverId: z.string().refine((val) => val === 'ALL' || val.length === 24, {
    message: "Receiver ID must be a valid ObjectId or 'ALL'"
  }),
  content: z.string().min(1)
});

router.use(authMiddleware);
router.post('/', validateRequest({ body: sendSchema }), messageController.send);
router.get('/conversations', messageController.conversationSummaries);
router.get('/conversations/:userId', validateRequest({ params: z.object({ userId: z.string().length(24) }) }), messageController.conversationWithUser);
router.patch('/:id/read', validateRequest({ params: z.object({ id: z.string().length(24) }) }), messageController.markAsRead);
router.patch('/conversation/:userId/read', validateRequest({ params: z.object({ userId: z.string().length(24) }) }), messageController.markConversationAsRead);
router.post('/:id/like', validateRequest({ params: z.object({ id: z.string().length(24) }) }), messageController.toggleLike);

export default router;
