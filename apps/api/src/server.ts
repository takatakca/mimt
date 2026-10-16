import { buildApp } from "./app.js";
import { createDeps, createLogger } from "./bootstrap.js";
import { loadConfig } from "./config.js";
import { runDailyCostReport } from "./jobs/dailyCost.js";
import { pingHeartbeat } from "./monitoring/report.js";
import { deliverOutbox } from "./services/outbox.js";
import { PostgresRepository } from "./repo/postgres.js";
import { pruneExpiredRateBuckets } from "./fraud/postgresRateLimiter.js";

const config = loadConfig();
const log = createLogger(config);
const deps = createDeps(config, log);
const app = await buildApp(deps);

// TAKATAK webhook outbox: small in-process poller (one API instance; move to a worker when scaling out).
const outboxTimer = setInterval(() => {
  deliverOutbox({ repo: deps.repo, config, log: app.log }).catch((err) => app.log.error({ err }, "outbox delivery failed"));
}, 15_000);
outboxTimer.unref();

const heartbeatTimer = setInterval(() => {
  pingHeartbeat(config.BETTER_STACK_HEARTBEAT_URL).catch(() => app.log.warn("heartbeat failed"));
}, 60_000);
heartbeatTimer.unref();

// Shared anti-abuse bucket cleanup: not on the request or 9-1-1 path.
// Run on startup as well as hourly so short-lived containers still clean up.
// Each invocation removes at most 1000 fully expired HMAC-only rows.
// Row locks + SKIP LOCKED make concurrent replicas safe.
let rateBucketCleanupRunning = false;
async function cleanRateBuckets() {
  if (rateBucketCleanupRunning || !(deps.repo instanceof PostgresRepository)) return;
  rateBucketCleanupRunning = true;
  try {
    const removed = await pruneExpiredRateBuckets(deps.repo.sql, 1_000);
    if (removed) app.log.info({ removed }, "expired rate-limit buckets pruned");
  } catch {
    // Avoid writing database errors or query parameters to logs.
    app.log.warn("rate-limit bucket maintenance failed");
  } finally {
    rateBucketCleanupRunning = false;
  }
}
const rateBucketCleanupTimer = setInterval(() => { void cleanRateBuckets(); }, 60 * 60 * 1_000);
rateBucketCleanupTimer.unref();

const costTimer = setInterval(() => {
  runDailyCostReport({ twilio: deps.twilio, config, log: app.log }).catch((err) => app.log.error({ err }, "daily cost report failed"));
}, 24 * 60 * 60 * 1000);
costTimer.unref();

async function shutdown(signal: string) {
  app.log.info({ signal }, "shutting down");
  clearInterval(outboxTimer);
  clearInterval(heartbeatTimer);
  clearInterval(costTimer);
  clearInterval(rateBucketCleanupTimer);
  await app.close();
  await deps.repo.close();
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

await app.listen({ port: config.PORT, host: config.HOST });
void cleanRateBuckets();
