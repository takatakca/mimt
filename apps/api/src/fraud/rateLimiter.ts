export interface RateRule {
  capacity: number;
  /** Seconds to refill the bucket completely. */
  windowSeconds: number;
}

/** Token-bucket rate limiter. In-memory now; a Redis implementation can replace it for multi-instance deploys. */
export interface RateLimiter {
  take(key: string, rule: RateRule, cost?: number): Promise<boolean>;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { tokens: number; at: number }>();

  constructor(private readonly now: () => number = Date.now) {}

  async take(key: string, rule: RateRule, cost = 1): Promise<boolean> {
    const t = this.now();
    const refillPerMs = rule.capacity / (rule.windowSeconds * 1000);
    const b = this.buckets.get(key) ?? { tokens: rule.capacity, at: t };
    b.tokens = Math.min(rule.capacity, b.tokens + (t - b.at) * refillPerMs);
    b.at = t;
    const ok = b.tokens >= cost;
    if (ok) b.tokens -= cost;
    this.buckets.set(key, b);
    if (this.buckets.size > 100_000) this.sweep(t);
    return ok;
  }

  private sweep(t: number) {
    for (const [k, b] of this.buckets) if (t - b.at > 86_400_000) this.buckets.delete(k);
  }
}
