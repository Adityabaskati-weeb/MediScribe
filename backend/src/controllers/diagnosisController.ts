import { Request, Response } from 'express';
import { analyzeClinicalIntake, generateDiagnosis } from '../services/analysisService';
import { successResponse } from '../utils/apiResponse';

export async function generateDiagnosisForIntake(req: Request, res: Response) {
  const stored = await analyzeClinicalIntake(req.body);
  const diagnosis = await generateDiagnosis({
    patientAge: req.body.patient.age_years,
    gender: req.body.patient.gender === 'male' ? 'M' : req.body.patient.gender === 'female' ? 'F' : 'unknown',
    symptoms: [req.body.chief_complaint, ...(req.body.symptoms || [])].filter(Boolean),
    vitals: req.body.vitals || {},
    medicalHistory: req.body.patient.known_conditions || [],
    medications: req.body.patient.medications || []
  });
  return res.json(successResponse({ stored, diagnosis }));
}
