export interface RateRule {
  capacity: number;
  /** Seconds to refill the bucket completely. */
  windowSeconds: number;
}

/** Token-bucket rate limiter. Process-local only: use a shared store before scaling to multiple API replicas. */
export interface RateLimiter {
  take(key: string, rule: RateRule, cost?: number): Promise<boolean>;
}

/** A bounded, fail-closed in-memory limiter for single-instance deployments. */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; at: number }>();

  constructor(private readonly now: () => number = Date.now, private readonly maxBuckets = 100_000) {
    if (!Number.isSafeInteger(maxBuckets) || maxBuckets < 1) {
      throw new Error("maxBuckets must be a positive safe integer");
    }
  }

  async take(key: string, rule: RateRule, cost = 1): Promise<boolean> {
    // Invalid internal policy must not disable abuse protection.
    if (!Number.isFinite(rule.capacity) || rule.capacity <= 0 ||
        !Number.isFinite(rule.windowSeconds) || rule.windowSeconds <= 0 ||
        !Number.isFinite(cost) || cost <= 0) return false;

    const t = this.now();
    if (!Number.isFinite(t)) return false;
    let b = this.buckets.get(key);
    if (!b) {
      // Unknown keys cannot allocate unlimited memory during a spray attack.
      if (this.buckets.size >= this.maxBuckets) this.sweep(t);
      if (this.buckets.size >= this.maxBuckets) return false;
      b = { tokens: rule.capacity, at: t };
    }
    const refillPerMs = rule.capacity / (rule.windowSeconds * 1000);
    // Wall clocks can move backwards: never subtract tokens or rewind a bucket.
    const elapsed = Math.max(0, t - b.at);
    b.tokens = Math.min(rule.capacity, b.tokens + elapsed * refillPerMs);
    b.at = Math.max(t, b.at);
    const ok = b.tokens >= cost;
    if (ok) b.tokens -= cost;
    this.buckets.set(key, b);
    return ok;
  }

  private sweep(t: number) {
    for (const [k, b] of this.buckets) if (t - b.at > 86_400_000) this.buckets.delete(k);
  }
}
