import { createHash } from 'crypto';

export interface AuditLogEntry {
  audit_id: string;
  event_type: 'AI_DECISION' | 'SAFETY_ESCALATION' | 'SYNC_CONFLICT' | 'ACCESS_CHECK';
  actor_role: 'health_worker' | 'doctor' | 'admin' | 'system';
  patient_id?: string;
  assessment_id?: string;
  decision_hash: string;
  summary: string;
  created_at: string;
}

const auditLog: AuditLogEntry[] = [];

export function stableHash(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

export function recordAuditLog(entry: Omit<AuditLogEntry, 'audit_id' | 'created_at' | 'decision_hash'> & { payload: unknown }) {
  const created: AuditLogEntry = {
    audit_id: `audit-${auditLog.length + 1}`,
    created_at: new Date().toISOString(),
    decision_hash: stableHash(entry.payload),
    event_type: entry.event_type,
    actor_role: entry.actor_role,
    patient_id: entry.patient_id,
    assessment_id: entry.assessment_id,
    summary: entry.summary
  };
  auditLog.push(created);
  if (auditLog.length > 500) auditLog.shift();
  return created;
}

export function listAuditLogs() {
  return auditLog.slice(-100).reverse();
}
