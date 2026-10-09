import type { FastifyInstance } from "fastify";
import type { VoiceTokenResponse } from "@mimt/shared";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { loadContext, requireUser } from "../auth/guard.js";
import { notConfigured } from "../lib/errors.js";
import { parse } from "../lib/validate.js";

const TOKEN_TTL_S = 3600;

export async function voiceRoutes(app: FastifyInstance, deps: AppDeps) {
  app.get("/v1/voice/token", { preHandler: requireUser(deps) }, async (req): Promise<VoiceTokenResponse> => {
    const { platform } = parse(z.object({ platform: z.enum(["ios", "android", "web"]).default("web") }), req.query);
    if (!deps.twilio || !deps.config.TWILIO_TWIML_APP_SID) throw notConfigured("Voice");
    const { user } = await loadContext(deps, req);
    // Tokens are issued even to restricted accounts: they must still receive calls and dial 9-1-1.
    const { token, expiresAt } = deps.twilio.createVoiceToken(user.id, platform, TOKEN_TTL_S);
    return { token, identity: user.id, expiresAt: expiresAt.toISOString() };
  });
}
