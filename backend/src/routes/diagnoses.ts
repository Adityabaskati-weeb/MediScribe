import { Router } from 'express';
import {
  generateAgenticDiagnosisForIntake,
  generateDiagnosisForIntake,
  getEvaluationMetrics,
  getHackathonDemoOutput,
  getPerformanceMetrics
} from '../controllers/diagnosisController';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { validateDiagnosisInput } from '../utils/validators';

const router = Router();

router.post('/generate', requireRole(['health_worker', 'doctor', 'admin']), validateBody(validateDiagnosisInput), asyncHandler(generateDiagnosisForIntake));
router.post('/agentic', requireRole(['health_worker', 'doctor', 'admin']), validateBody(validateDiagnosisInput), asyncHandler(generateAgenticDiagnosisForIntake));
router.get('/evaluation', asyncHandler(getEvaluationMetrics));
router.get('/performance', asyncHandler(getPerformanceMetrics));
router.get('/demo-output', asyncHandler(getHackathonDemoOutput));

export default router;
