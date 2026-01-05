import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { createSession, listSessions, deleteSession, updateSession, getStats } from '../controllers/sessions/session.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.post('/', authorize('trainer'), createSession);
router.get('/', listSessions);
router.delete('/:id', authorize('trainer'), deleteSession);
router.patch('/:id', upload.single('evidenceImage'), updateSession);

export default router;
