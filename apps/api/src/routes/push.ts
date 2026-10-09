import type { FastifyInstance } from "fastify";
import type { PushRegisterRequest } from "@mimt/shared";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { loadContext, requireUser } from "../auth/guard.js";
import { parse } from "../lib/validate.js";

const RegisterBody = z.object({
  // APNs tokens are 64 hex chars, FCM tokens ~160+ chars; keep a generous upper bound.
  token: z.string().trim().min(8).max(4096).regex(/^[\x21-\x7e]+$/, "token must be printable ASCII"),
  platform: z.enum(["ios", "android"]),
  kind: z.literal("messages").default("messages"),
}) satisfies z.ZodType<PushRegisterRequest, unknown>;

export async function pushRoutes(app: FastifyInstance, deps: AppDeps) {
  // Message-notification device token (incoming calls use Twilio's VoIP push, not this).
  app.post("/v1/push/register", { preHandler: requireUser(deps), config: { rateLimit: { max: 20, timeWindow: "1 minute" } } }, async (req, reply) => {
    const body = parse(RegisterBody, req.body);
    const { user } = await loadContext(deps, req);
    await deps.repo.upsertPushToken({ userId: user.id, platform: body.platform, kind: body.kind, token: body.token });
    return reply.code(204).send();
  });
}
