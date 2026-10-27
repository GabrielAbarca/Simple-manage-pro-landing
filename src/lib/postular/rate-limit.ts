// Best-effort sliding-window limiter for /api/postular. It lives in the
// serverless instance's memory, so a cold start or a second instance resets
// it: it exists to blunt a script hammering one warm function, not to be a
// guarantee. The key map is pruned and capped so it cannot grow unbounded.

export interface RateLimiter {
  /** Records one request for `key`; false once the key is over its limit. */
  allow(key: string, nowMs?: number): boolean;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  /** Upper bound on tracked keys; the oldest is dropped past it. */
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
