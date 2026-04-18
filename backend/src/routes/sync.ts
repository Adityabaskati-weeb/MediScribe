import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { markSynced, pendingSync, receiveSyncItems } from '../services/clinicalEngine';
import { successResponse } from '../utils/apiResponse';

const router = Router();

router.get('/pending', asyncHandler(async (_req, res) => {
  return res.json(successResponse({ items: pendingSync() }));
}));

router.post('/push', asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const accepted = receiveSyncItems(items);
  return res.json(successResponse({ accepted_count: accepted.length, accepted }));
}));

router.post('/ack', asyncHandler(async (req, res) => {
  const syncIds = Array.isArray(req.body?.sync_ids) ? req.body.sync_ids : [];
  return res.json(successResponse(markSynced(syncIds)));
}));

router.get('/status', asyncHandler(async (_req, res) => {
  const items = pendingSync();
  return res.json(successResponse({ pending_count: items.length, last_checked_at: new Date().toISOString() }));
}));

export default router;
