import { stableHash } from './auditLogService';

interface CacheEntry<T> {
  value: T;
  expires_at: number;
  created_at: string;
}

const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = Number(process.env.MEDICAL_CACHE_TTL_MS || 10 * 60 * 1000);

export function getCachedMedicalQuery<T>(keyParts: unknown[]): T | undefined {
  const key = cacheKey(keyParts);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires_at < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCachedMedicalQuery<T>(keyParts: unknown[], value: T) {
  cache.set(cacheKey(keyParts), {
    value,
    expires_at: Date.now() + TTL_MS,
    created_at: new Date().toISOString()
  });
  return value;
}

export function cacheStats() {
  return {
    entries: cache.size,
    ttl_ms: TTL_MS,
    strategy: 'Stable SHA-256 key over normalized symptoms, vitals, history, and model task.'
  };
}

function cacheKey(keyParts: unknown[]) {
  return stableHash(keyParts);
}
