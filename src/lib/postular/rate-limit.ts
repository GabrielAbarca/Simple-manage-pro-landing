export interface RateLimiter {
  allow(key: string, nowMs?: number): boolean;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  maxKeys?: number;
}

export const POSTULAR_RATE_LIMIT: RateLimitOptions = { maxRequests: 5, windowMs: 10 * 60 * 1000, maxKeys: 5_000 };

function pruneExpired(hits: Map<string, number[]>, windowStart: number): void {
  for (const [key, timestamps] of hits) {
    const recent = timestamps.filter((time) => time > windowStart);
    if (recent.length) hits.set(key, recent);
    else hits.delete(key);
  }
}

function dropOldestKey(hits: Map<string, number[]>): void {
  const oldestKey = hits.keys().next().value;
  if (oldestKey !== undefined) hits.delete(oldestKey);
}

export function createRateLimiter({ maxRequests, windowMs, maxKeys = 5_000 }: RateLimitOptions): RateLimiter {
  const hits = new Map<string, number[]>();
  let lastPrune = 0;
  return {
    allow(key, nowMs = Date.now()) {
      const windowStart = nowMs - windowMs;
      if (nowMs - lastPrune > windowMs) {
        pruneExpired(hits, windowStart);
        lastPrune = nowMs;
      }
      const recent = (hits.get(key) ?? []).filter((time) => time > windowStart);
      if (recent.length >= maxRequests) return false;
      hits.delete(key);
      hits.set(key, [...recent, nowMs]);
      if (hits.size > maxKeys) dropOldestKey(hits);
      return true;
    },
  };
}
