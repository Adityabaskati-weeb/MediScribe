import { NextFunction, Request, Response } from 'express';
import { createHmac } from 'crypto';
import { errorResponse } from '../utils/apiResponse';

const PUBLIC_PATHS = ['/health', '/metrics', '/api/system/architecture', '/api/system/demo-pack', '/api/diagnoses/evaluation', '/api/diagnoses/performance', '/api/diagnoses/demo-output'];

type Role = 'health_worker' | 'doctor' | 'admin';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.API_KEY;
  const jwtSecret = process.env.JWT_SECRET;
  if ((!configuredKey && !jwtSecret) || PUBLIC_PATHS.includes(req.path)) return next();

  const suppliedKey = req.header('x-api-key');
  if (configuredKey && suppliedKey === configuredKey) {
    (req as any).user = { role: req.header('x-user-role') || 'health_worker', auth: 'api-key' };
    return next();
  }

  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (jwtSecret && token) {
    const user = verifyHs256Jwt(token, jwtSecret);
    if (user) {
      (req as any).user = user;
      return next();
    }
  }

  return res.status(401).json(errorResponse('Missing or invalid API key or JWT', 401));
}

export function requireRole(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!process.env.API_KEY && !process.env.JWT_SECRET) return next();
    const role = (req as any).user?.role || req.header('x-user-role');
    if (!roles.includes(role)) return res.status(403).json(errorResponse('Role not allowed for this operation', 403));
    return next();
  };
}

function verifyHs256Jwt(token: string, secret: string): { role: Role; sub?: string; auth: 'jwt' } | undefined {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return undefined;
  const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  if (expected !== signature) return undefined;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (parsed.exp && parsed.exp * 1000 < Date.now()) return undefined;
  const role = ['health_worker', 'doctor', 'admin'].includes(parsed.role) ? parsed.role : 'health_worker';
  return { role, sub: parsed.sub, auth: 'jwt' };
}
