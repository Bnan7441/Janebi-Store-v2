import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: (err as any).issues,
    });
  }

  console.error('Unhandled Error:', err);

  res.status(err.status || 500).json({
    error: env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
}
