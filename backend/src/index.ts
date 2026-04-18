import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import diagnosisRoutes from './routes/diagnoses';
import patientRoutes from './routes/patients';
import syncRoutes from './routes/sync';
import { queueCapture, analyzeQueued, dashboardSummary, clinicReports } from './services/clinicalEngine';
import { initializeDatabase } from './config/database';
import { apiKeyAuth } from './middleware/auth';
import { errorMiddleware } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);
app.use(rateLimiter);
app.use(apiKeyAuth);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mediscribe-backend',
    timestamp: new Date().toISOString(),
    architecture: 'Node/Express + PostgreSQL + Gemma/Ollama'
  });
});

app.use('/api/patients', patientRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/sync', syncRoutes);

app.post('/api/offline/intake', (req, res) => {
  res.json({ success: true, data: queueCapture(req.body), timestamp: new Date().toISOString(), statusCode: 200 });
});

app.post('/api/offline/queue/:draftId/analyze', (req, res) => {
  const stored = analyzeQueued(req.params.draftId);
  if (!stored) return res.status(404).json({ success: false, error: 'Draft not found', timestamp: new Date().toISOString(), statusCode: 404 });
  return res.json({ success: true, data: stored, timestamp: new Date().toISOString(), statusCode: 200 });
});

app.get('/api/dashboard', (_req, res) => {
  res.json({ success: true, data: dashboardSummary(), timestamp: new Date().toISOString(), statusCode: 200 });
});

app.get('/api/dashboard/stats', (_req, res) => {
  res.json({ success: true, data: dashboardSummary(), timestamp: new Date().toISOString(), statusCode: 200 });
});

app.get('/api/dashboard/reports', (_req, res) => {
  res.json({ success: true, data: clinicReports(), timestamp: new Date().toISOString(), statusCode: 200 });
});

app.use(errorMiddleware);

initializeDatabase()
  .catch((error) => {
    console.warn(`Database initialization skipped: ${error.message}`);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`MediScribe backend running on ${port}`);
    });
  });
