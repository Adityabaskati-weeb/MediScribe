import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { dashboardSummary, listPatients, recentAssessments, upsertPatient } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';
import { validatePatientInput } from '../utils/validators';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  const errors = validatePatientInput(req.body);
  if (errors.length > 0) return res.status(400).json({ success: false, errors });
  const patient = upsertPatient({
    patient_id: req.body.patient_id || req.body.external_id || `patient_${Date.now()}`,
    name: req.body.name || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim(),
    age_years: req.body.age_years ?? req.body.age,
    gender: req.body.gender || 'unknown',
    known_conditions: req.body.known_conditions || [],
    medications: req.body.medications || [],
    allergies: req.body.allergies || []
  });
  return res.json(successResponse(patient));
}));

router.get('/', asyncHandler(async (_req, res) => {
  return res.json(successResponse(listPatients()));
}));

router.get('/:patientId', asyncHandler(async (req, res) => {
  const patient = listPatients().find((item) => item.patient_id === req.params.patientId);
  if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
  return res.json(successResponse(patient));
}));

router.get('/:patientId/history', asyncHandler(async (req, res) => {
  const history = recentAssessments().filter((assessment) => assessment.patient_id === req.params.patientId);
  return res.json(successResponse(history));
}));

router.get('/dashboard/summary', asyncHandler(async (_req, res) => {
  return res.json(successResponse(dashboardSummary()));
}));

router.get('/recent', asyncHandler(async (_req, res) => {
  return res.json(successResponse(recentAssessments()));
}));

export default router;
