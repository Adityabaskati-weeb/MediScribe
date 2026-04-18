import { Router } from 'express';
import {
  createPatient,
  getDashboardSummary,
  getPatient,
  getPatientHistory,
  getPatients,
  getRecentAssessments
} from '../controllers/patientController';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { validatePatientInput } from '../utils/validators';

const router = Router();

router.post('/', validateBody(validatePatientInput), asyncHandler(createPatient));
router.get('/', asyncHandler(getPatients));
router.get('/dashboard/summary', asyncHandler(getDashboardSummary));
router.get('/recent', asyncHandler(getRecentAssessments));
router.get('/:patientId', asyncHandler(getPatient));
router.get('/:patientId/history', asyncHandler(getPatientHistory));

export default router;
