import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/apiResponse';

export class AppError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
  }
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorMiddleware(err: Error | AppError, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json(errorResponse(err.message || 'Internal server error', statusCode));
}
