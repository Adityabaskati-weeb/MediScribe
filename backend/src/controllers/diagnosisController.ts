import { Request, Response } from 'express';
import { analyzeClinicalIntake, generateDiagnosis } from '../services/analysisService';
import { agenticEvaluationMetrics, runAgenticMedicalAssessment } from '../services/agentOrchestrator';
import { performanceSummary } from '../services/performanceMonitor';
import { successResponse } from '../utils/apiResponse';

export async function generateDiagnosisForIntake(req: Request, res: Response) {
  const agentic = await analyzeClinicalIntake(req.body);
  const diagnosis = await generateDiagnosis({
    patientAge: req.body.patient.age_years,
    gender: req.body.patient.gender === 'male' ? 'M' : req.body.patient.gender === 'female' ? 'F' : 'unknown',
    symptoms: [req.body.chief_complaint, ...(req.body.symptoms || [])].filter(Boolean),
    vitals: req.body.vitals || {},
    medicalHistory: req.body.patient.known_conditions || [],
    medications: req.body.patient.medications || []
  });
  return res.json(successResponse({ agentic, diagnosis }));
}

export async function generateAgenticDiagnosisForIntake(req: Request, res: Response) {
  const agentic = await runAgenticMedicalAssessment(req.body);
  return res.json(successResponse(agentic));
}

export async function getEvaluationMetrics(_req: Request, res: Response) {
  return res.json(successResponse(agenticEvaluationMetrics()));
}

export async function getPerformanceMetrics(_req: Request, res: Response) {
  return res.json(successResponse(performanceSummary()));
}

export async function getHackathonDemoOutput(_req: Request, res: Response) {
  const demo = await runAgenticMedicalAssessment({
    patient: {
      name: 'Asha Devi',
      age_years: 58,
      gender: 'female',
      known_conditions: ['hypertension'],
      medications: ['amlodipine']
    },
    chief_complaint: 'Crushing chest pain with sweating',
    symptoms: ['shortness of breath', 'left arm pain'],
    vitals: {
      systolic_bp: 84,
      diastolic_bp: 56,
      oxygen_saturation: 89,
      respiratory_rate: 32
    },
    language: 'Hindi',
    offline_captured: true
  });

  return res.json(successResponse({
    title: 'MediScribe hackathon demo output',
    video_moment: 'Offline rural clinic detects a cardiac emergency and guides referral.',
    agentic_assessment: demo,
    talking_points: [
      'Separate agents handle diagnosis, reasoning, treatment, and safety.',
      'Safety guardrails override model confidence when red flags appear.',
      'Fallback rules keep the app useful without internet or Ollama.',
      'Metrics expose accuracy, latency, reliability, and fallback rate.'
    ]
  }));
}
