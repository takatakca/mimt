import { createHmac } from "node:crypto";
const hmacKey = Buffer.alloc(32, 42).toString("base64");
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgresRateLimiter } from "../src/fraud/postgresRateLimiter.js";

const url = process.env.MIMT_RATE_LIMIT_TEST_DATABASE_URL;
const migration = new URL("../../../supabase/migrations/20261015173000_shared_rate_limit_buckets.sql", import.meta.url);

describe.skipIf(!url)("shared PostgreSQL rate limit (isolated CI database)", () => {
  let first: ReturnType<typeof postgres>;
  let second: ReturnType<typeof postgres>;

  beforeAll(async () => {
    first = postgres(url!, { max: 6 });
    second = postgres(url!, { max: 6 });
    await first.unsafe(readFileSync(migration, "utf8"));
  });
  afterAll(async () => {
    await Promise.all([first?.end({ timeout: 5 }), second?.end({ timeout: 5 })]);
  });

  it("serializes many simultaneous attempts across independent connections", async () => {
    const limiterA = new PostgresRateLimiter(first, hmacKey);
    const limiterB = new PostgresRateLimiter(second, hmacKey);
    const key = "otp:isolated-concurrent-" + crypto.randomUUID();
    const rule = { capacity: 5, windowSeconds: 600 };
    const results = await Promise.all(Array.from({ length: 50 }, (_, i) =>
      (i % 2 === 0 ? limiterA : limiterB).take(key, rule)));
    expect(results.filter(Boolean)).toHaveLength(5);
    expect(results.filter((allowed) => !allowed)).toHaveLength(45);
    expect(await limiterA.take(key, rule)).toBe(false);

    const hash = createHmac("sha256", Buffer.from(hmacKey, "base64")).update("mimt-rate-limit-v1:").update(key).digest("hex");
    const rows = await first`select key_hash, tokens from public.fraud_rate_buckets where key_hash = ${hash}`;
    expect(rows).toHaveLength(1);
    expect(rows[0]?.key_hash).toBe(hash);
    expect(JSON.stringify(rows)).not.toContain(key);
  });

  it("refills using database time, consistently between connections", async () => {
    const key = "sms:isolated-refill-" + crypto.randomUUID();
    const hash = createHmac("sha256", Buffer.from(hmacKey, "base64")).update("mimt-rate-limit-v1:").update(key).digest("hex");
    const a = new PostgresRateLimiter(first, hmacKey);
    const b = new PostgresRateLimiter(second, hmacKey);
    const rule = { capacity: 1, windowSeconds: 60 };
    expect(await a.take(key, rule)).toBe(true);
    expect(await b.take(key, rule)).toBe(false);
    await first`update public.fraud_rate_buckets set updated_at = clock_timestamp() - interval '61 seconds' where key_hash = ${hash}`;
    expect(await b.take(key, rule)).toBe(true);
    expect(await a.take(key, rule)).toBe(false);
  });

  it("keeps the table private with RLS enabled", async () => {
    const records = await first`
      select relrowsecurity from pg_class where oid = 'public.fraud_rate_buckets'::regclass
    `;
    expect(records[0]?.relrowsecurity).toBe(true);
    const roles = await first`select count(*)::int as amount from pg_policies where tablename = 'fraud_rate_buckets'`;
    expect(roles[0]?.amount).toBe(0);
  });
});

describe("shared limiter outage safeguards", () => {
  it("requires a strong independent HMAC secret", () => {
    const fake = { begin: async () => [] } as unknown as ReturnType<typeof postgres>;
    for (const secret of ["", "not-secret", Buffer.alloc(8).toString("base64")]) {
      expect(() => new PostgresRateLimiter(fake, secret)).toThrow(/RATE_LIMIT_HMAC_KEY/);
    }
  });
  it("denies requests on database failure without logging account or email", async () => {
    const report = vi.fn();
    const failing = { begin: async () => { throw new Error("sensitive database detail"); } } as unknown as ReturnType<typeof postgres>;
    const limiter = new PostgresRateLimiter(failing, hmacKey, report);
    expect(await limiter.take("otp:+15145550123", { capacity: 3, windowSeconds: 600 })).toBe(false);
    expect(report).toHaveBeenCalledTimes(1);
    expect(await limiter.take("", { capacity: 3, windowSeconds: 600 })).toBe(false);
    expect(report).toHaveBeenCalledTimes(1);
  });
});
