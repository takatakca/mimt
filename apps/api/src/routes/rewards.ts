import type { FastifyInstance } from "fastify";
import type { ApiError } from "@mimt/shared";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { requireUser } from "../auth/guard.js";
import { parse } from "../lib/validate.js";

const ClaimBody = z.object({ kind: z.literal("rewarded_ad_10min"), adUnitId: z.string().min(1).max(200) });

export async function rewardRoutes(app: FastifyInstance, deps: AppDeps) {
  // TODO(rewards): never trust the client for rewards. Implement AdMob server-side verification (SSV):
  // a GET callback from Google (/webhooks/admob/ssv) whose ECDSA signature is checked against
  // https://www.gstatic.com/admob/reward/verifier-keys.json, with custom_data binding the user and
  // transaction_id stored with useOnce() to stop replays. Only that callback credits bonusMinutesOut;
  // this endpoint will then just report whether the verified reward has arrived.
  app.post("/v1/rewards/claim", { preHandler: requireUser(deps) }, async (req, reply) => {
    parse(ClaimBody, req.body);
    const body: ApiError = {
      error: "not_implemented",
      message: "Les minutes en prime ne sont pas encore offertes. Merci de votre patience!",
    };
    return reply.code(501).send(body);
  });
}
