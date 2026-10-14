import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { HttpError } from "../lib/errors.js";
import { parse } from "../lib/validate.js";

const text = (max: number) => z.string().trim().max(max);
const email = z.email().max(254);
const base = z.object({
  form: z.enum(["waitlist", "demo", "contact"]),
  locale: z.enum(["fr-CA", "en-CA"]),
  fields: z.record(z.string(), z.string()),
  consents: z.object({ marketing: z.boolean(), marketingText: text(800) }).strict(),
  page: z.string().startsWith("/").max(200),
  submittedAt: z.string().optional(),
}).strict();

const fields = {
  waitlist: z.object({
    email,
    interest: z.enum(["mobile", "business", "home_phone", "internet", "cellular"]),
  }).strict(),
  demo: z.object({
    name: text(120).min(1),
    company: text(150).min(1),
    email,
    phone: text(40),
    lines: z.string().regex(/^$|^[1-9][0-9]{0,3}$/),
    message: text(3000),
  }).strict(),
  contact: z.object({
    name: text(120).min(1),
    email,
    topic: z.enum(["question", "business", "privacy", "accessibility", "complaint", "media"]),
    message: text(3000).min(1),
  }).strict(),
};

/** Avoid treating an unverified checkbox as an active marketing subscription. */
export async function publicLeadRoutes(app: FastifyInstance, deps: AppDeps) {
  app.post("/v1/public/leads", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
  }, async (req, reply) => {
    // A public browser form always has an Origin; reject cross-site form POSTs.
    const origin = req.headers.origin;
    if (!origin || origin !== "https://mimt.ca") {
      throw new HttpError(403, "invalid_origin", "Origin not allowed");
    }
    const body = parse(base, req.body);
    const checked = parse(fields[body.form], body.fields);
    const normalizedEmail = checked.email.trim().toLowerCase();
    // Prevent address-targeted abuse, without logging personal information.
    const emailHash = createHash("sha256").update(normalizedEmail).digest("hex");
    const allowed = await deps.rateLimiter.take(`lead:${emailHash}`, { capacity: 3, windowSeconds: 3600 });
    if (!allowed) throw new HttpError(429, "rate_limited", "Please try again later");

    // Store the text seen next to the unchecked-by-default consent box.
    // Only a request to opt in; delivery of marketing needs email verification.
    const marketingText = body.consents.marketing ? body.consents.marketingText : "";
    if (body.consents.marketing && marketingText.length < 30) {
      throw new HttpError(400, "invalid_consent", "Consent text is required");
    }
    await deps.repo.createPublicLead({
      formKind: body.form,
      locale: body.locale,
      email: normalizedEmail,
      fields: { ...checked, email: normalizedEmail },
      marketingOptInRequested: body.consents.marketing,
      marketingText,
      sourcePath: body.page,
    });
    // No personal information, row identifiers or marketing state are disclosed.
    return reply.code(202).send({ accepted: true });
  });
}
