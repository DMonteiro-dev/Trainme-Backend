import { NextFunction, Response } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { UserModel } from '../models/user.model.js';
import { AuthenticatedRequest } from '../types/express/index.js';

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Authorization header missing' } });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: { message: 'Token missing' } });
    }
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
    next();
  };
};

export const authMiddleware = authenticate;
