export interface PerformanceEvent {
  name: string;
  duration_ms: number;
  success: boolean;
  fallback_used?: boolean;
  timestamp: string;
}

const events: PerformanceEvent[] = [];

export async function timed<T>(
  name: string,
  run: () => Promise<T>,
  meta: { fallback_used?: boolean } = {}
): Promise<T> {
  const started = Date.now();
  try {
    const result = await run();
    recordPerformance({ name, duration_ms: Date.now() - started, success: true, ...meta });
    return result;
  } catch (error) {
    recordPerformance({ name, duration_ms: Date.now() - started, success: false, ...meta });
    throw error;
  }
}

export function recordPerformance(event: Omit<PerformanceEvent, 'timestamp'>) {
  events.push({ ...event, timestamp: new Date().toISOString() });
  if (events.length > 200) events.shift();
}

export function performanceSummary() {
  const total = events.length;
  const sorted = [...events].sort((a, b) => a.duration_ms - b.duration_ms);
  const avg = total ? Math.round(events.reduce((sum, event) => sum + event.duration_ms, 0) / total) : 0;
  const p95 = total ? sorted[Math.min(sorted.length - 1, Math.floor(total * 0.95))].duration_ms : 0;
  const failures = events.filter((event) => !event.success).length;
  const fallbacks = events.filter((event) => event.fallback_used).length;
  return {
    total_requests: total,
    average_latency_ms: avg,
    p95_latency_ms: p95,
    reliability: total ? Number(((total - failures) / total).toFixed(3)) : 1,
    fallback_rate: total ? Number((fallbacks / total).toFixed(3)) : 0,
    optimization_strategy: [
      'Run deterministic safety checks before LLM calls.',
      'Use Gemma only for explainable differential reasoning.',
      'Cache offline guideline packs and local medical rules.',
      'Return fallback triage if Ollama exceeds latency or availability limits.',
      'Keep prompts compact and structured to reduce token latency.'
    ],
    recent_events: events.slice(-10).reverse()
  };
}
