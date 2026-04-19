import crypto from 'crypto';

export type Specialty = 'general' | 'classification' | 'pediatrics' | 'cardiology' | 'obstetrics' | 'orthopedics' | 'neurology' | 'dermatology';
export type Region = 'Asia' | 'Africa' | 'Americas' | 'Europe';
export type HealthcareLevel = 'basic' | 'primary' | 'secondary' | 'tertiary';
export type PricingTier = 'free' | 'clinic' | 'hospital' | 'enterprise';

export function now() {
  return new Date().toISOString();
}

export function stableId(prefix: string, value: unknown) {
  return `${prefix}-${crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12)}`;
}

export function hashNumber(value: string) {
  const digest = crypto.createHash('sha256').update(value).digest();
  return Math.abs(digest.readInt32BE(0));
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

