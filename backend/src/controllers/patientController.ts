import { Request, Response } from 'express';
import { dashboardSummary, listPatients, recentAssessments, upsertPatient } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';

export async function createPatient(req: Request, res: Response) {
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
}

export async function getPatients(_req: Request, res: Response) {
  return res.json(successResponse(listPatients()));
}

export async function getPatient(req: Request, res: Response) {
  const patient = listPatients().find((item) => item.patient_id === req.params.patientId);
  if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
  return res.json(successResponse(patient));
}

export async function getPatientHistory(req: Request, res: Response) {
  const history = recentAssessments().filter((assessment) => assessment.patient_id === req.params.patientId);
  return res.json(successResponse(history));
}

export async function getDashboardSummary(_req: Request, res: Response) {
  return res.json(successResponse(dashboardSummary()));
}

export async function getRecentAssessments(_req: Request, res: Response) {
  return res.json(successResponse(recentAssessments()));
}
