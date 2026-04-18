import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { pendingSync } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.get('/pending', asyncHandler(async (_req, res) => {
  return res.json(successResponse({ items: pendingSync() }));
}));

export default router;
