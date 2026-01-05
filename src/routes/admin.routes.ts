import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { userController } from '../controllers/users/user.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { trainerRelationController } from '../controllers/users/trainerRelation.controller.js';
import { trainerChangeRequestController } from '../controllers/users/trainerChangeRequest.controller.js';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'trainer', 'client'])
});

const updateStatusSchema = z.object({
  status: z.enum(['active', 'blocked', 'pending'])
});

const relationSchema = z.object({
  clientId: z.string().length(24),
  trainerId: z.string().length(24).nullable()
});

const relationUpdateSchema = z.object({
  trainerId: z.string().length(24).nullable()
});

const requestIdParams = z.object({
  id: z.string().length(24)
});

const listChangeRequestsSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

router.use(authMiddleware, roleMiddleware(['admin']));

router.get('/users', userController.adminListUsers);
router.get('/users/:id', validateRequest({ params: z.object({ id: z.string().length(24) }) }), userController.adminGetUserById);
router.post('/users', validateRequest({ body: createUserSchema }), userController.adminCreateUser);
router.patch('/users/:id/status', validateRequest({ params: z.object({ id: z.string().length(24) }), body: updateStatusSchema }), userController.adminUpdateStatus);
router.patch(
  '/users/:id/role',
  validateRequest({
    params: z.object({ id: z.string().length(24) }),
    body: z.object({ role: z.enum(['admin', 'trainer', 'client']) })
  }),
  userController.adminUpdateRole
);

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'trainer', 'client']).optional(),
  status: z.enum(['active', 'blocked', 'pending']).optional()
});

router.patch(
  '/users/:id',
  validateRequest({
    params: z.object({ id: z.string().length(24) }),
    body: adminUpdateUserSchema
  }),
  userController.adminUpdateUser
);

router.get('/trainers', trainerRelationController.listTrainers);
router.get('/clients', trainerRelationController.listClients);
router.post('/relations', validateRequest({ body: relationSchema }), trainerRelationController.createRelation);
router.patch(
  '/relations/:clientId',
  validateRequest({ params: z.object({ clientId: z.string().length(24) }), body: relationUpdateSchema }),
  trainerRelationController.updateRelation
);

router.get(
  '/trainer-change-requests',
  validateRequest({ query: listChangeRequestsSchema }),
  trainerChangeRequestController.listAdminRequests
);
router.patch(
  '/trainer-change-requests/:id/approve',
  validateRequest({ params: requestIdParams }),
  trainerChangeRequestController.approveRequest
);
router.patch(
  '/trainer-change-requests/:id/reject',
  validateRequest({ params: requestIdParams }),
  trainerChangeRequestController.rejectRequest
);

export default router;
