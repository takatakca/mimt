import { createHmac } from "node:crypto";
const hmacKey = Buffer.alloc(32, 42).toString("base64");
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgresRateLimiter, pruneExpiredRateBuckets } from "../src/fraud/postgresRateLimiter.js";
import { PostgresRepository } from "../src/repo/postgres.js";

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

  it("prunes fully expired identities but leaves recent limits intact", async () => {
    const limiter = new PostgresRateLimiter(first, hmacKey);
    const expired = "sms:expired-" + crypto.randomUUID();
    const active = "sms:active-" + crypto.randomUUID();
    const hash = (key: string) => createHmac("sha256", Buffer.from(hmacKey, "base64"))
      .update("mimt-rate-limit-v1:").update(key).digest("hex");
    const rule = { capacity: 1, windowSeconds: 60 };
    expect(await limiter.take(expired, rule)).toBe(true);
    expect(await limiter.take(active, rule)).toBe(true);
    const oldHash = hash(expired);
    await first`update public.fraud_rate_buckets
      set last_seen_at = clock_timestamp() - interval '2 hours'
      where key_hash = ${oldHash}`;
    expect(await pruneExpiredRateBuckets(first)).toBeGreaterThanOrEqual(1);
    expect((await first`select key_hash from public.fraud_rate_buckets where key_hash = ${oldHash}`)).toHaveLength(0);
    expect(await limiter.take(active, rule)).toBe(false);
  });

  it("bounds each maintenance pass without deleting active or partially refilled buckets", async () => {
    const a = new PostgresRateLimiter(first, hmacKey);
    const keys = Array.from({ length: 3 }, () => "prune-batch:" + crypto.randomUUID());
    const rule = { capacity: 1, windowSeconds: 60 };
    for (const key of keys) expect(await a.take(key, rule)).toBe(true);
    const hash = (key: string) => createHmac("sha256", Buffer.from(hmacKey, "base64"))
      .update("mimt-rate-limit-v1:").update(key).digest("hex");
    const hashes = keys.map(hash);
    await first`update public.fraud_rate_buckets
      set last_seen_at = clock_timestamp() - interval '2 hours'
      where key_hash in ${first(hashes)}`;
    const removed = await pruneExpiredRateBuckets(first, 1);
    expect(removed).toBe(1);
    const remaining = await first`select key_hash from public.fraud_rate_buckets where key_hash in ${first(hashes)}`;
    expect(remaining).toHaveLength(2);
    const activeKey = "prune-active:" + crypto.randomUUID();
    expect(await a.take(activeKey, rule)).toBe(true);
    const activeHash = hash(activeKey);
    expect(await pruneExpiredRateBuckets(first, 10_000)).toBeGreaterThanOrEqual(2);
    expect(await first`select key_hash from public.fraud_rate_buckets where key_hash in ${first(hashes)}`).toHaveLength(0);
    expect(await first`select key_hash from public.fraud_rate_buckets where key_hash = ${activeHash}`).toHaveLength(1);
    expect(await a.take(activeKey, rule)).toBe(false);
    for (const bad of [0, -1, 10_001, Number.NaN, 1.1]) {
      await expect(pruneExpiredRateBuckets(first, bad)).rejects.toThrow(/batch/);
    }
  });

  it("allows parallel maintenance workers to drain expired keys safely", async () => {
    const limiter = new PostgresRateLimiter(first, hmacKey);
    const keys = Array.from({ length: 4 }, () => "prune-parallel:" + crypto.randomUUID());
    const hash = (key: string) => createHmac("sha256", Buffer.from(hmacKey, "base64"))
      .update("mimt-rate-limit-v1:").update(key).digest("hex");
    const hashes = keys.map(hash);
    for (const key of keys) expect(await limiter.take(key, { capacity: 1, windowSeconds: 60 })).toBe(true);
    await first`update public.fraud_rate_buckets set last_seen_at = clock_timestamp() - interval '2 hours'
      where key_hash in ${first(hashes)}`;
    const attempts = await Promise.all([
      pruneExpiredRateBuckets(first, 2),
      pruneExpiredRateBuckets(second, 2),
    ]);
    expect(attempts.every((n) => n <= 2)).toBe(true);
    await pruneExpiredRateBuckets(first, 10_000);
    expect(await first`select key_hash from public.fraud_rate_buckets where key_hash in ${first(hashes)}`).toHaveLength(0);
  });

  it("rejects an incomplete or RLS-unprotected database at /readyz storage check", async () => {
    const repo = new PostgresRepository(url!);
    try {
      // Only rate-limit migration exists in the isolated test DB at this stage.
      await expect(repo.ping()).rejects.toThrow(/migrations or RLS incomplete/);
      const required = [
        "users", "refresh_tokens", "telecom_accounts", "subscriptions", "entitlements",
        "phone_numbers", "e911_addresses", "e911_acknowledgements", "calls", "messages",
        "voicemails", "consents", "usage_ledger", "fraud_events", "handoffs",
        "used_once_keys", "sms_opt_outs", "takatak_outbox", "audit_log",
        "push_tokens", "attested_devices", "ad_rewards", "public_leads",
      ];
      // Test metadata only. These empty CI fixtures are NOT production migrations.
      for (const table of required) {
        await first.unsafe("create table if not exists public." + table + " (id integer)");
        await first.unsafe("alter table public." + table + " enable row level security");
      }
      await expect(repo.ping()).resolves.toBeUndefined();
      await first.unsafe("alter table public.users disable row level security");
      await expect(repo.ping()).rejects.toThrow(/migrations or RLS incomplete/);
    } finally {
      await first.unsafe("alter table public.users enable row level security");
      await repo.close();
    }
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
