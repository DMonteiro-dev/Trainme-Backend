import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/express/index.js';

export const roleMiddleware = (allowedRoles: Array<'admin' | 'trainer' | 'client'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Authentication required' } });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Insufficient permissions' } });
    }

    return next();
  };
};
