import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError, ZodSchema } from 'zod';

interface SchemaMap {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (schemas: SchemaMap) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        const validatedQuery = await schemas.query.parseAsync(req.query);
        // Safely update req.query since it might be a getter in some environments
        if (req.query && typeof req.query === 'object') {
          for (const key in req.query) {
            delete (req.query as any)[key];
          }
          Object.assign(req.query, validatedQuery);
        }
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        (error as ZodError & { statusCode?: number }).statusCode = 400;
      }
      return next(error);
    }
  };
};
