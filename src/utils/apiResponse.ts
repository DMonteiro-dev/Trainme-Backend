import { Response } from 'express';

interface ApiResponseOptions<T> {
  res: Response;
  data?: T;
  message?: string;
  statusCode?: number;
  pagination?: Record<string, unknown>;
}

export const sendSuccess = <T>({ res, data, message = 'OK', statusCode = 200, pagination }: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({ data, message, pagination });
};

export const sendError = (res: Response, statusCode: number, message: string, details?: unknown) => {
  return res.status(statusCode).json({ error: { message, details } });
};
