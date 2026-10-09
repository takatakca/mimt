import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { requireUser, loadContext } from "../auth/guard.js";
import { conflict, forbidden, notConfigured, notFound, unauthorized } from "../lib/errors.js";
import { randomToken, safeEqual, sha256Hex } from "../lib/crypto.js";
import { parse } from "../lib/validate.js";
import { getFeatures, HELD_STATES, setAccountStatus } from "../services/accounts.js";

const HANDOFF_TTL_MS = 2 * 60 * 1000;

const ActivationBody = z.object({
  global_user_id: z.string().min(1).max(128),
  workspace_id: z.string().min(1).max(128),
  business_id: z.string().min(1).max(128).nullish(),
  plan_hint: z.enum(["free", "lock", "premium", "business", "business_pro"]).nullish(),
  locale: z.enum(["fr-CA", "en-CA"]).default("fr-CA"),
});
const ClaimBody = z.object({ handoffId: z.string().min(20).max(128) });

function bearer(req: FastifyRequest): string {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) throw unauthorized("Missing TAKATAK handoff token");
  return h.slice(7).trim();
}

export async function handoffRoutes(app: FastifyInstance, deps: AppDeps) {
  const { repo } = deps;

  // Flow B: TAKATAK's server announces an activation. Authenticated by a TAKATAK-signed JWT (aud=mimt, ≤60 s, single-use jti).
  app.post("/v1/handoff/activations", async (req, reply) => {
    const claims = await deps.takatak.verifyHandoffToken(bearer(req));
    const body = parse(ActivationBody, req.body);
    if (claims.sub !== body.global_user_id) throw unauthorized("Token subject does not match global_user_id");

    const handoffId = randomToken(32);
    const expiresAt = new Date(deps.now().getTime() + HANDOFF_TTL_MS);
    await repo.createHandoff({
      tokenHash: sha256Hex(handoffId),
      globalUserId: body.global_user_id,
      workspaceId: body.workspace_id,
      businessId: body.business_id ?? null,
      planHint: body.plan_hint ?? null,
      locale: body.locale,
      jti: claims.jti,
      expiresAt,
    });
    return reply.code(201).send({ handoff_id: handoffId, expires_at: expiresAt.toISOString() });
  });

  // The signed-in MIMT user (Flow A) redeems the handoff; it grants nothing on its own.
  app.post("/v1/handoff/claim", { preHandler: requireUser(deps) }, async (req) => {
    const { handoffId } = parse(ClaimBody, req.body);
    const { user, account } = await loadContext(deps, req);
    const h = await repo.findHandoffByTokenHash(sha256Hex(handoffId));
    if (!h) throw notFound("handoff_not_found");
    if (h.claimedAt) throw conflict("handoff_already_used");
    if (h.expiresAt.getTime() <= deps.now().getTime()) throw conflict("handoff_expired");
    if (!user.globalUserId || user.globalUserId !== h.globalUserId) throw forbidden("handoff_user_mismatch");
    if (!(await repo.claimHandoff(h.id, user.id, deps.now()))) throw conflict("handoff_already_used");

    const updated = await repo.updateAccount(account.id, {
      workspaceId: h.workspaceId,
      businessId: h.businessId ?? account.businessId,
      ...(h.businessId ? { kind: "business" as const } : {}),
    });
    const final = account.status === "ACTIVE_INDEPENDENT" ? await setAccountStatus(repo, updated, "ACTIVE_MANAGED", "takatak_handoff") : updated;
    await repo.audit({ actorUserId: user.id, action: "handoff.claimed", targetType: "telecom_account", targetId: account.id, ip: req.ip });
    return {
      telecomAccountId: final.id,
      workspaceId: final.workspaceId,
      businessId: final.businessId,
      planHint: h.planHint,
      status: final.status,
    };
  });

  // TAKATAK dashboard overview (server-to-server, API key). No message content, no call details.
  app.get("/v1/takatak/overview", async (req) => {
    const expected = deps.config.MIMT_API_KEY_SHA256 ?? (deps.config.MIMT_API_KEY ? sha256Hex(deps.config.MIMT_API_KEY) : null);
    if (!expected) throw notConfigured("TAKATAK API access");
    const provided = req.headers["x-mimt-api-key"] ?? req.headers.authorization?.replace(/^Bearer /, "");
    if (typeof provided !== "string" || !safeEqual(sha256Hex(provided), expected.toLowerCase())) throw unauthorized("Invalid API key");

    const { global_user_id } = parse(z.object({ global_user_id: z.string().min(1).max(128) }), req.query);
    const user = await repo.findUserByGlobalId(global_user_id);
    const account = user ? await repo.getAccountByOwner(user.id) : null;
    if (!user || !account) return { global_user_id, connected: false };

    const [{ plan, features }, numbers, address] = await Promise.all([
      getFeatures(repo, account.id),
      repo.listNumbersByAccount(account.id),
      repo.getE911Address(account.id),
    ]);
    return {
      global_user_id,
      connected: true,
      telecom_account_id: account.id,
      workspace_id: account.workspaceId,
      business_id: account.businessId,
      kind: account.kind,
      status: account.status,
      plan,
      features: [...features].sort(),
      e911_registered: Boolean(address),
      numbers: numbers.filter((n) => HELD_STATES.has(n.state)).map((n) => ({ phone_number_id: n.id, e164: n.e164, state: n.state })),
    };
  });
}
