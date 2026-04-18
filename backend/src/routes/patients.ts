import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { dashboardSummary, recentAssessments } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';
import { validatePatientInput } from '../utils/validators';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const errors = validatePatientInput(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  return res.json(successResponse({ external_id: req.body.patient_id || `patient_${Date.now()}`, ...req.body }));
}));

router.get('/dashboard/summary', asyncHandler(async (_req, res) => {
  return res.json(successResponse(dashboardSummary()));
}));

router.get('/recent', asyncHandler(async (_req, res) => {
  return res.json(successResponse(recentAssessments()));
}));

export default router;
