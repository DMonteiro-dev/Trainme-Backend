import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/apiResponse.js';

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`);
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return sendError(res, 400, 'Validation error', err.flatten());
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return sendError(res, 400, 'Database validation error', err.message);
  }

  if ((err as { statusCode?: number }).statusCode) {
    const statusCode = (err as { statusCode: number }).statusCode;
    return sendError(res, statusCode, (err as Error).message);
  }

  logger.error('Unexpected error', err);
  return sendError(res, 500, 'Internal server error');
};
