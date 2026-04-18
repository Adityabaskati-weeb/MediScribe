import { Router } from 'express';
import { generateDiagnosisForIntake } from '../controllers/diagnosisController';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';
import { validateDiagnosisInput } from '../utils/validators';

const router = Router();

router.post('/generate', validateBody(validateDiagnosisInput), asyncHandler(generateDiagnosisForIntake));

export default router;
