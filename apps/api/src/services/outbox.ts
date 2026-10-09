import type { FastifyBaseLogger } from "fastify";
import type { Config } from "../config.js";
import { signWebhook } from "../lib/crypto.js";
import type { Repository } from "../repo/types.js";

const MAX_ATTEMPTS = 10;

/** Delivers pending TAKATAK webhooks. Exponential backoff (30 s → ~4 h), dead-letter after 10 attempts. */
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
  for (const ev of await repo.listDueOutbox(now, 50)) {
    const body = JSON.stringify({ id: ev.id, type: ev.eventType, created_at: ev.createdAt.toISOString(), data: ev.payload });
    try {
      const res = await doFetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-mimt-signature": signWebhook(secret, body), "x-mimt-event": ev.eventType },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await repo.markOutboxDelivered(ev.id, new Date());
      delivered++;
    } catch (err) {
      failed++;
      const attempts = ev.attempts + 1;
      const next = attempts >= MAX_ATTEMPTS ? null : new Date(now.getTime() + Math.min(30_000 * 2 ** ev.attempts, 4 * 3600_000));
      await repo.markOutboxFailed(ev.id, String(err instanceof Error ? err.message : err), next);
      log.warn({ eventId: ev.id, type: ev.eventType, attempts, dead: next === null }, "TAKATAK webhook delivery failed");
    }
  }
  return { delivered, failed };
}
