import type { FastifyInstance } from "fastify";
import type { E911AckResponse, E911AddressResponse, E911NoticeResponse } from "@mimt/shared";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { loadContext, requireUser } from "../auth/guard.js";
import { conflict, notFound } from "../lib/errors.js";
import { parse } from "../lib/validate.js";
import { e911Notice } from "../e911/notice.js";
import type { E911Address } from "../repo/types.js";
import { HELD_STATES } from "../services/accounts.js";

function addressDto(a: E911Address): E911AddressResponse {
  return {
    id: a.id,
    street: a.street,
    unit: a.unit,
    city: a.city,
    province: a.province,
    postalCode: a.postalCode,
    country: a.country,
    validated: Boolean(a.validatedAt),
    providerRegistered: Boolean(a.providerRef),
  };
}

const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"] as const;
export const POSTAL_CODE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

export const AddressBody = z.object({
  customerName: z.string().trim().min(1).max(100).optional(),
  street: z.string().trim().min(3).max(200),
  unit: z.string().trim().max(50).optional(),
  city: z.string().trim().min(1).max(100),
  province: z
    .string()
    .trim()
    .transform((p) => p.toUpperCase())
    .pipe(z.enum(PROVINCES)),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE, "invalid Canadian postal code")
    .transform((p) => {
      const c = p.replace(/\s/g, "").toUpperCase();
      return `${c.slice(0, 3)} ${c.slice(3)}`;
    }),
  country: z.literal("CA").default("CA"),
});

export async function e911Routes(app: FastifyInstance, deps: AppDeps) {
  const { repo } = deps;

  app.get("/v1/e911/notice", async (req): Promise<E911NoticeResponse> => {
    const { locale } = parse(z.object({ locale: z.enum(["fr-CA", "en-CA"]).default("fr-CA") }), req.query);
    return e911Notice(deps.config.E911_NOTICE_VERSION, locale);
  });

  // Current address (to prefill the form). 404 when none is registered yet.
  app.get("/v1/e911/address", { preHandler: requireUser(deps) }, async (req): Promise<E911AddressResponse> => {
    const { account } = await loadContext(deps, req);
    const address = await repo.getE911Address(account.id);
    if (!address) throw notFound("no_e911_address", "No 9-1-1 address registered");
    return addressDto(address);
  });

  app.put("/v1/e911/address", { preHandler: requireUser(deps) }, async (req): Promise<E911AddressResponse> => {
    const body = parse(AddressBody, req.body);
    const { user, account } = await loadContext(deps, req);
    const customerName = body.customerName ?? user.displayName ?? "Client MIMT";

    let providerRef: string | null = null;
    let validatedAt: Date | null = null;
    const numbers = (await repo.listNumbersByAccount(account.id)).filter((n) => HELD_STATES.has(n.state));
    if (deps.twilio) {
      const addr = await deps.twilio.createEmergencyAddress({ ...body, customerName, unit: body.unit ?? null });
      providerRef = addr.sid;
      validatedAt = addr.validated ? deps.now() : null;
      for (const n of numbers) if (n.twilioSid) await deps.twilio.attachEmergencyAddress(n.twilioSid, addr.sid);
    }
    const saved = await repo.upsertE911Address({
      telecomAccountId: account.id,
      phoneNumberId: numbers[0]?.id ?? null,
      customerName,
      street: body.street,
      unit: body.unit ?? null,
      city: body.city,
      province: body.province,
      postalCode: body.postalCode,
      country: "CA",
      validatedAt,
      providerRef,
    });
    await repo.audit({ actorUserId: user.id, action: "e911.address_updated", targetType: "e911_address", targetId: saved.id, ip: req.ip });
    return addressDto(saved);
  });

  app.post("/v1/e911/acknowledge", { preHandler: requireUser(deps) }, async (req, reply) => {
    const { noticeVersion } = parse(z.object({ noticeVersion: z.string().min(1).max(64) }), req.body);
    if (noticeVersion !== deps.config.E911_NOTICE_VERSION) throw conflict("stale_notice_version", `Current notice is ${deps.config.E911_NOTICE_VERSION}`);
    const { user } = await loadContext(deps, req);
    const appVersion = req.headers["x-app-version"];
    const ack = await repo.addE911Ack({
      userId: user.id,
      noticeVersion,
      acceptedAt: deps.now(),
      ip: req.ip,
      appVersion: typeof appVersion === "string" ? appVersion.slice(0, 64) : null,
      userAgent: req.headers["user-agent"]?.slice(0, 256) ?? null,
    });
    const res: E911AckResponse = { noticeVersion: ack.noticeVersion, acceptedAt: ack.acceptedAt.toISOString() };
    return reply.code(201).send(res);
  });
}

/** True when the user may place PSTN calls / claim numbers: address registered and current notice accepted. */
export async function e911Ready(deps: AppDeps, userId: string, accountId: string): Promise<{ address: boolean; ack: boolean }> {
  const [address, ack] = await Promise.all([deps.repo.getE911Address(accountId), deps.repo.getLatestE911Ack(userId)]);
  return { address: Boolean(address), ack: ack?.noticeVersion === deps.config.E911_NOTICE_VERSION };
}
