import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/apiResponse';

const PUBLIC_PATHS = ['/health'];

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.API_KEY;
  if (!configuredKey || PUBLIC_PATHS.includes(req.path)) return next();

  const suppliedKey = req.header('x-api-key');
  if (suppliedKey !== configuredKey) {
    return res.status(401).json(errorResponse('Missing or invalid API key', 401));
  }

  return next();
}
