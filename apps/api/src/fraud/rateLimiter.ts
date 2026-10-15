export interface RateRule {
  capacity: number;
  /** Seconds to refill the bucket completely. */
  windowSeconds: number;
}

/** Token-bucket interface. The in-memory implementation is per API instance, NOT distributed. */
export interface RateLimiter {
  take(key: string, rule: RateRule, cost?: number): Promise<boolean>;
}

type Bucket = { tokens: number; at: number; windowMs: number };

/**
 * Bounded, fail-closed local limiter.
 *
 * Retain the existing fractional token refill semantics. A burst of many
 * distinct keys must not grow the process heap without bound, nor evict an
 * active rate-limit bucket and give an attacker another fresh allowance.
 * Deploy one API instance until a shared atomic limiter is configured.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly now: () => number = Date.now,
    private readonly maxBuckets = 50_000,
  ) {
    if (!Number.isSafeInteger(maxBuckets) || maxBuckets < 1) {
      throw new Error("maxBuckets must be a positive safe integer");
    }
  }

  async take(key: string, rule: RateRule, cost = 1): Promise<boolean> {
    if (!key || !Number.isFinite(rule.capacity) || rule.capacity <= 0 ||
        !Number.isFinite(rule.windowSeconds) || rule.windowSeconds <= 0 ||
        !Number.isFinite(cost) || cost <= 0) {
      throw new Error("Invalid rate limiter key, capacity, window or cost");
    }
    if (cost > rule.capacity) return false;

    const t = this.now();
    if (!Number.isFinite(t)) throw new Error("Rate limiter requires a finite timestamp");
    const windowMs = rule.windowSeconds * 1000;
    if (!Number.isFinite(windowMs)) throw new Error("Rate limiter window too large");

    let b = this.buckets.get(key);
    if (!b) {
      // Remove only fully refilled, idle buckets. Active limits are NEVER
      // evicted to accommodate untrusted keys; deny if the map remains full.
      if (this.buckets.size >= this.maxBuckets) this.sweep(t);
      if (this.buckets.size >= this.maxBuckets) return false;
      b = { tokens: rule.capacity, at: t, windowMs };
    } else {
      const elapsed = Math.max(0, t - b.at);
      b.tokens = Math.min(rule.capacity, b.tokens + elapsed * (rule.capacity / windowMs));
      // A clock rollback must not create tokens or move the clock backwards.
      b.at = Math.max(t, b.at);
      b.windowMs = windowMs;
    }

    const allowed = b.tokens >= cost;
    if (allowed) b.tokens -= cost;
    this.buckets.set(key, b);
    return allowed;
  }

  private sweep(t: number) {
    for (const [key, b] of this.buckets) {
      if (t >= b.at && t - b.at >= b.windowMs) this.buckets.delete(key);
    }
  }
}
