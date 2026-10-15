import { createHash } from "node:crypto";
import type postgres from "postgres";
import type { RateLimiter, RateRule } from "./rateLimiter.js";

type Sql = postgres.Sql<{}>;
type BucketRow = { tokens: number; elapsedSeconds: number };

/**
 * Atomic PostgreSQL token bucket, shared between API replicas.
 *
 * A transaction serializes one bucket's INSERT/SELECT FOR UPDATE/UPDATE.
 * No untrusted key content is stored: SHA-256 protects phone/email/account IDs
 * from appearing in the database or in SQL diagnostic logs.
 *
 * Never invoke on the emergency (9-1-1) call path. On DB failure, return
 * false rather than granting a new allowance or falling back to memory.
 */
export class PostgresRateLimiter implements RateLimiter {
  constructor(
    private readonly sql: Sql,
    private readonly onUnavailable: () => void = () => undefined,
  ) {}

  async take(key: string, rule: RateRule, cost = 1): Promise<boolean> {
    if (!key || !Number.isFinite(rule.capacity) || rule.capacity <= 0 ||
      !Number.isFinite(rule.windowSeconds) || rule.windowSeconds <= 0 ||
      !Number.isFinite(cost) || cost <= 0 ||
      !Number.isFinite(rule.windowSeconds * 1000)) {
      return false;
    }
    if (cost > rule.capacity) return false;
    const hash = createHash("sha256").update(key).digest("hex");

    try {
      return await this.sql.begin(async (tx) => {
        // Concurrent first requests serialize at the unique-key conflict.
        // The inserted row starts full, not already spent.
        await tx`
          insert into public.fraud_rate_buckets
            (key_hash, tokens, updated_at, window_seconds, last_seen_at)
          values (${hash}, ${rule.capacity}, clock_timestamp(), ${rule.windowSeconds}, clock_timestamp())
          on conflict (key_hash) do nothing
        `;
        const rows = await tx<BucketRow[]>`
          select tokens,
            greatest(0, extract(epoch from (clock_timestamp() - updated_at)))::double precision as "elapsedSeconds"
          from public.fraud_rate_buckets
          where key_hash = ${hash}
          for update
        `;
        const row = rows[0];
        if (!row) throw new Error("rate limit row missing");
        const available = Math.min(rule.capacity,
          Number(row.tokens) + Math.max(0, Number(row.elapsedSeconds)) * rule.capacity / rule.windowSeconds);
        if (!Number.isFinite(available)) throw new Error("invalid shared bucket state");
        const allowed = available >= cost;
        const remaining = Math.max(0, allowed ? available - cost : available);
        await tx`
          update public.fraud_rate_buckets
          set tokens = ${remaining}, updated_at = clock_timestamp(),
              last_seen_at = clock_timestamp(), window_seconds = ${rule.windowSeconds}
          where key_hash = ${hash}
        `;
        return allowed;
      });
    } catch {
      // Never leak DB error details or sensitive key material into logs.
      this.onUnavailable();
      return false;
    }
  }
}
