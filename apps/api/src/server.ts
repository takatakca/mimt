import { buildApp } from "./app.js";
import { createDeps, createLogger } from "./bootstrap.js";
import { loadConfig } from "./config.js";
import { deliverOutbox } from "./services/outbox.js";

const config = loadConfig();
const log = createLogger(config);
const deps = createDeps(config, log);
const app = await buildApp(deps);

// TAKATAK webhook outbox: small in-process poller (one API instance; move to a worker when scaling out).
const outboxTimer = setInterval(() => {
  deliverOutbox({ repo: deps.repo, config, log: app.log }).catch((err) => app.log.error({ err }, "outbox delivery failed"));
}, 15_000);
outboxTimer.unref();

async function shutdown(signal: string) {
  app.log.info({ signal }, "shutting down");
  clearInterval(outboxTimer);
  await app.close();
  await deps.repo.close();
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

await app.listen({ port: config.PORT, host: config.HOST });
