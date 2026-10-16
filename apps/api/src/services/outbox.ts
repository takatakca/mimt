import type { FastifyBaseLogger } from "fastify";
import type { Config } from "../config.js";
import { signWebhook } from "../lib/crypto.js";
import type { Repository } from "../repo/types.js";

const MAX_ATTEMPTS = 10;

/** Leased, at-least-once TAKATAK webhooks; receiver must deduplicate on event id. */
export async function deliverOutbox(input: {
  repo: Repository;
  config: Config;
  log: FastifyBaseLogger;
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<{ delivered: number; failed: number }> {
  const { repo, config, log } = input;
  const url = config.TAKATAK_WEBHOOK_URL;
  const secret = config.TAKATAK_WEBHOOK_SECRET;
  if (!url || !secret) return { delivered: 0, failed: 0 };
  const now = input.now ?? new Date();
  const doFetch = input.fetchImpl ?? fetch;
  let delivered = 0;
  let failed = 0;
  // Five sequential 10s requests complete before a 120s lease expires.
  for (const ev of await repo.claimDueOutbox(now, 5, 120_000)) {
    // The claim's exact lease deadline fences off stale workers.
    if (!ev.nextAttemptAt) continue;
    const leaseUntil = ev.nextAttemptAt;
    const body = JSON.stringify({ id: ev.id, type: ev.eventType, created_at: ev.createdAt.toISOString(), data: ev.payload });
    try {
      const res = await doFetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-mimt-signature": signWebhook(secret, body), "x-mimt-event": ev.eventType },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const acknowledged = await repo.markOutboxDelivered(ev.id, new Date(), leaseUntil);
      if (acknowledged) delivered++;
    } catch (err) {
      const attempts = ev.attempts + 1;
      const next = attempts >= MAX_ATTEMPTS ? null : new Date(now.getTime() + Math.min(30_000 * 2 ** ev.attempts, 4 * 3600_000));
      const applied = await repo.markOutboxFailed(ev.id, String(err instanceof Error ? err.message : err), next, leaseUntil);
      if (applied) {
        failed++;
        log.warn({ eventId: ev.id, type: ev.eventType, attempts, dead: next === null }, "TAKATAK webhook delivery failed");
      }
    }
  }
  return { delivered, failed };
}
