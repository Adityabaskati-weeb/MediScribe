import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/apiResponse';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const maxRequests = Number(process.env.RATE_LIMIT_MAX || 120);

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.header('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json(errorResponse('Rate limit exceeded', 429));
  }

  return next();
}
