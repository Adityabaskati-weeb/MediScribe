import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import { listAuditLogs } from '../services/auditLogService';
import { cacheStats } from '../services/medicalQueryCache';
import { performanceSummary } from '../services/performanceMonitor';
import { demoReadinessPack, productionSystemDesign } from '../services/systemDesignService';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.get('/architecture', asyncHandler(async (_req, res) => {
  res.json(successResponse(productionSystemDesign()));
}));

router.get('/demo-pack', asyncHandler(async (_req, res) => {
  res.json(successResponse(demoReadinessPack()));
}));

router.get('/audit-logs', requireRole(['doctor', 'admin']), asyncHandler(async (_req, res) => {
  res.json(successResponse(listAuditLogs()));
}));

router.get('/operations', asyncHandler(async (_req, res) => {
  res.json(successResponse({
    performance: performanceSummary(),
    cache: cacheStats(),
    monitoring: {
      prometheus: '/metrics in production gateway profile',
      grafana: 'dashboard service reads API KPIs and production compose includes Grafana'
    }
  }));
}));

export default router;
