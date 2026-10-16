import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { PostgresRepository } from "../src/repo/postgres.js";
import { MemoryRepository } from "../src/repo/memory.js";
import { deliverOutbox } from "../src/services/outbox.js";
import { testConfig } from "./helpers.js";

const dbUrl = process.env.MIMT_RATE_LIMIT_TEST_DATABASE_URL;

describe.skipIf(!dbUrl)("TAKATAK outbox atomic claim (isolated PostgreSQL)", () => {
  const database = "mimt_outbox_" + randomUUID().replaceAll("-", "").slice(0, 16);
  let admin: ReturnType<typeof postgres>;
  let a: PostgresRepository;
  let b: PostgresRepository;

  beforeAll(async () => {
    admin = postgres(dbUrl!, { max: 1 });
    await admin.unsafe("create database " + database);
    const target = new URL(dbUrl!);
    target.pathname = "/" + database;
    a = new PostgresRepository(target.toString(), { max: 3 });
    b = new PostgresRepository(target.toString(), { max: 3 });
    await a.sql.unsafe("create table takatak_outbox (id uuid primary key default gen_random_uuid(), event_type text not null, payload jsonb not null, attempts integer not null default 0, next_attempt_at timestamptz default now(), delivered_at timestamptz, last_error text, created_at timestamptz not null default now())");
    await a.sql.unsafe("alter table takatak_outbox enable row level security");
  });

  afterAll(async () => {
    await a?.close();
    await b?.close();
    if (admin) {
      await admin.unsafe("drop database if exists " + database);
      await admin.end({ timeout: 5 });
    }
  });

  it("assigns each event to exactly one contender across connection pools", async () => {
    const ev = await a.enqueueOutbox("entitlement.updated", { plan: "premium" });
    const now = new Date(Date.now() + 1000);
    const batch = await Promise.all(Array.from({ length: 20 }, (_, i) =>
      (i % 2 ? a : b).claimDueOutbox(now, 1)));
    expect(batch.flat().map((x) => x.id)).toEqual([ev.id]);
    const claimedLease = batch.flat()[0]?.nextAttemptAt;
    expect(await b.claimDueOutbox(new Date(now.getTime() + 30_000), 1)).toEqual([]);
    expect(await a.markOutboxDelivered(ev.id, now, claimedLease!)).toBe(true);
  });

  it("recovers abandoned claims after the lease timeout", async () => {
    const ev = await a.enqueueOutbox("phone_number.assigned", { numberId: "test" });
    const now = new Date(Date.now() + 1000);
    expect((await a.claimDueOutbox(now, 1)).map((x) => x.id)).toContain(ev.id);
    expect(await b.claimDueOutbox(new Date(now.getTime() + 60_000), 1)).toEqual([]);
    const retried = await b.claimDueOutbox(new Date(now.getTime() + 121_000), 1);
    expect(retried.map((x) => x.id)).toContain(ev.id);
    expect(await a.markOutboxDelivered(ev.id, now, leased[0]!.nextAttemptAt!)).toBe(false);
    expect(await b.markOutboxDelivered(ev.id, now, retried[0]!.nextAttemptAt!)).toBe(true);
    expect(await b.claimDueOutbox(new Date(now.getTime() + 240_000), 1)).toEqual([]);
  });

  it("prevents a stale worker from marking a reclaimed event as failed or delivered", async () => {
    const event = await a.enqueueOutbox("entitlement.updated", { status: "active" });
    const start = new Date(Date.now() + 1000);
    const firstClaim = (await a.claimDueOutbox(start, 1))[0]!;
    const secondClaim = (await b.claimDueOutbox(new Date(start.getTime() + 121_000), 1))[0]!;
    expect(secondClaim.id).toBe(event.id);
    expect(firstClaim.nextAttemptAt?.getTime()).not.toBe(secondClaim.nextAttemptAt?.getTime());
    expect(await a.markOutboxFailed(event.id, "stale", null, firstClaim.nextAttemptAt!)).toBe(false);
    expect(await a.markOutboxDelivered(event.id, start, firstClaim.nextAttemptAt!)).toBe(false);
    const current = await b.sql`select next_attempt_at, attempts, delivered_at from takatak_outbox where id = ${event.id}`;
    expect(new Date(current[0]!.nextAttemptAt).getTime()).toBe(secondClaim.nextAttemptAt!.getTime());
    expect(current[0]!.attempts).toBe(0);
    expect(current[0]!.deliveredAt).toBeNull();
    expect(await b.markOutboxDelivered(event.id, start, secondClaim.nextAttemptAt!)).toBe(true);
    expect(await b.markOutboxDelivered(event.id, start, secondClaim.nextAttemptAt!)).toBe(false);
  });

  it("posts once when two workers process one due event concurrently", async () => {
    await a.enqueueOutbox("telecom_account.status_changed", { accountId: "test" });
    const sent = vi.fn(async () => new Response("ok", { status: 200 }));
    const config = testConfig({ TAKATAK_WEBHOOK_URL: "https://takatak.test/hooks/mimt", TAKATAK_WEBHOOK_SECRET: "secret" });
    const log = { warn: vi.fn() } as never;
    const now = new Date(Date.now() + 1000);
    const result = await Promise.all([
      deliverOutbox({ repo: a, config, log, now, fetchImpl: sent as never }),
      deliverOutbox({ repo: b, config, log, now, fetchImpl: sent as never }),
    ]);
    expect(result.reduce((sum, x) => sum + x.delivered, 0)).toBe(1);
    expect(sent).toHaveBeenCalledTimes(1);
  });
});

describe("outbox lease in memory", () => {
  it("ignores stale acknowledgements and retry changes after a lease is reissued", async () => {
    const repo = new MemoryRepository();
    const ev = await repo.enqueueOutbox("entitlement.updated", { plan: "premium" });
    const now = new Date(Date.now() + 1000);
    const initial = (await repo.claimDueOutbox(now, 1))[0]!;
    const newer = (await repo.claimDueOutbox(new Date(now.getTime() + 121_000), 1))[0]!;
    expect(await repo.markOutboxFailed(ev.id, "old error", null, initial.nextAttemptAt!)).toBe(false);
    expect(await repo.markOutboxDelivered(ev.id, now, initial.nextAttemptAt!)).toBe(false);
    expect(repo.outbox[0]!.nextAttemptAt).toEqual(newer.nextAttemptAt);
    expect(repo.outbox[0]!.attempts).toBe(0);
    expect(await repo.markOutboxFailed(ev.id, "new error", null, newer.nextAttemptAt!)).toBe(true);
    expect(repo.outbox[0]!.lastError).toBe("new error");
  });

  it("does not grant a second worker an active claim", async () => {
    const repo = new MemoryRepository();
    const ev = await repo.enqueueOutbox("entitlement.updated", { plan: "premium" });
    const now = new Date(Date.now() + 1000);
    expect((await repo.claimDueOutbox(now, 1)).map((x) => x.id)).toEqual([ev.id]);
    expect(await repo.claimDueOutbox(new Date(now.getTime() + 10_000), 1)).toEqual([]);
    expect((await repo.claimDueOutbox(new Date(now.getTime() + 121_000), 1)).map((x) => x.id)).toEqual([ev.id]);
  });
});
