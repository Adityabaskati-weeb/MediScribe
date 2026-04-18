import { Router } from 'express';
import { analyzeClinicalIntake } from '../services/analysisService';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/apiResponse';
import { validateDiagnosisInput } from '../utils/validators';

const router = Router();

router.post('/generate', asyncHandler(async (req, res) => {
  const errors = validateDiagnosisInput(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  const result = await analyzeClinicalIntake(req.body);
  return res.json(successResponse(result));
}));

export default router;
