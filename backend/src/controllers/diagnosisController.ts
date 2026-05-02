import { Request, Response } from 'express';
import { DEMO_CASES, demoCaseById } from '../data/demoCases';
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

export async function getHackathonDemoCases(_req: Request, res: Response) {
  return res.json(
    successResponse({
      cases: DEMO_CASES.map((item) => ({
        id: item.id,
        title: item.title,
        story: item.story,
        language: item.language,
        hero: item.hero,
        demo_mode: item.demo_mode,
        expected_track_strength: item.expected_track_strength,
        intake: item.intake
      }))
    })
  );
}

export async function getHackathonDemoOutput(req: Request, res: Response) {
  const requestedId = typeof req.query.caseId === 'string' ? req.query.caseId : undefined;
  const selected = demoCaseById(requestedId);
  const demo = await runAgenticMedicalAssessment(selected.intake);

  return res.json(successResponse({
    title: 'MediScribe hackathon demo output',
    selected_case: {
      id: selected.id,
      title: selected.title,
      story: selected.story,
      language: selected.language,
      hero: selected.hero,
      demo_mode: selected.demo_mode,
      expected_track_strength: selected.expected_track_strength,
      intake: selected.intake
    },
    video_moment: selected.story,
    agentic_assessment: demo,
    talking_points: [
      'Separate agents handle diagnosis, reasoning, treatment, and safety.',
      'Safety guardrails override model confidence when red flags appear.',
      'Fallback rules keep the app useful without internet or Ollama.',
      'Metrics expose accuracy, latency, reliability, and fallback rate.',
      'Referral handoff now includes guideline-backed reasoning for a receiving facility.'
    ]
  }));
}
