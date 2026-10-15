import postgres from "postgres";
import { loadConfig } from "../config.js";
import { pruneExpiredRateBuckets } from "../fraud/postgresRateLimiter.js";

const config = loadConfig();
if (!config.DATABASE_URL) throw new Error("MIMT DATABASE_URL is required for the maintenance job");
const sql = postgres(config.DATABASE_URL, { max: 1 });

try {
  const removed = await pruneExpiredRateBuckets(sql);
  console.log("MIMT expired rate-limit buckets removed:", removed);
} finally {
  await sql.end({ timeout: 5 });
}
