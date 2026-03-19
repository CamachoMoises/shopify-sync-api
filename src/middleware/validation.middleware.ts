import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger.config';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        logger.warn('Validación fallida', { 
          path: req.path, 
          errors,
          body: req.body 
        });

        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};