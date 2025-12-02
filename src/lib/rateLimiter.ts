type TokenBucket = { tokens: number; last: number };

const BUCKETS = new Map<string, TokenBucket>();
const RATE = 8; // 8 reqs
const REFILL_MS = 10_000; // per 10s refill

export function rateLimiter(key: string) {
  const now = Date.now();
  let bucket = BUCKETS.get(key);
  if (!bucket) {
    bucket = { tokens: RATE, last: now };
    BUCKETS.set(key, bucket);
  }
  const elapsed = now - bucket.last;
  const refill = Math.floor(elapsed / REFILL_MS);
  if (refill > 0) {
    bucket.tokens = Math.min(RATE, bucket.tokens + refill);
    bucket.last = now;
  }
  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens };
  }
  return { allowed: false, remaining: 0 };
}
