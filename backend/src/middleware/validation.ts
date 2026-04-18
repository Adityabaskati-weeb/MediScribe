import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../utils/validators';

export function validateBody(validationFn: (data: any) => ValidationError[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationFn(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    return next();
  };
}
