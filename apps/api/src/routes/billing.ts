import type { FastifyInstance } from "fastify";
import { ADD_ONS, PLANS, type BillingPortalResponse, type CheckoutRequest, type CheckoutResponse, type PlanCode } from "@mimt/shared";
import type Stripe from "stripe";
import { z } from "zod";
import type { AppDeps } from "../deps.js";
import { loadContext, requireUser } from "../auth/guard.js";
import { badRequest, conflict, forbidden, HttpError, notConfigured } from "../lib/errors.js";
import { addDays } from "../lib/time.js";
import { parse } from "../lib/validate.js";
import type { Subscription, TelecomAccount } from "../repo/types.js";
import { getPlan, recomputeEntitlements, usagePeriods } from "../services/accounts.js";
import type { CheckoutLine } from "../gateways/billing.js";

const CheckoutBody = z
  .object({
    plan: z.enum(["lock", "premium", "business", "business_pro"]).optional(),
    addon: z.enum(["extra_number", "minutes_250", "intl_credit"]).optional(),
    interval: z.enum(["month", "year"]).default("month"),
    quantity: z.number().int().min(1).max(50).default(1),
    /** International credit amount, CAD cents. */
    amountCents: z.number().int().min(ADD_ONS.intl_credit_min.priceCents).max(10_000).optional(),
  })
  .refine((b) => Boolean(b.plan) !== Boolean(b.addon), "Pass exactly one of plan or addon");

const SUB_STATUSES = new Set<Subscription["status"]>(["active", "trialing", "past_due", "canceled", "incomplete", "unpaid"]);

export async function billingRoutes(app: FastifyInstance, deps: AppDeps) {
  const { repo, config } = deps;
  const auth = { preHandler: requireUser(deps) };
  const appUrl = config.APP_BASE_URL.replace(/\/$/, "");

  app.post("/v1/billing/checkout", auth, async (req): Promise<CheckoutResponse> => {
    const body = parse(CheckoutBody, req.body) satisfies CheckoutRequest;
    const { user, account } = await loadContext(deps, req);
    if (!deps.billing) throw notConfigured("Billing");
    const fr = user.locale === "fr-CA";
    const taxNote = fr ? "Prix avant taxes (TPS/TVQ et taxe 9-1-1 en sus)." : "Price before taxes (GST/QST and 9-1-1 tax extra).";

    let line: CheckoutLine;
    let mode: "subscription" | "payment";
    let code: string;
    if (body.plan) {
      const plan = PLANS[body.plan];
      const yearly = body.interval === "year";
      if (yearly && !plan.yearlyPriceCents) throw badRequest("no_yearly_price");
      if (!plan.perLine && body.quantity !== 1) throw badRequest("quantity_not_allowed");
      line = {
        name: `MIMT ${fr ? plan.name.fr : plan.name.en}`,
        description: taxNote,
        unitAmountCents: yearly ? plan.yearlyPriceCents! : plan.monthlyPriceCents,
        quantity: body.quantity,
        recurring: body.interval,
      };
      mode = "subscription";
      code = body.plan;
    } else if (body.addon === "extra_number") {
      const a = ADD_ONS.extra_number;
      line = { name: fr ? a.name.fr : a.name.en, description: taxNote, unitAmountCents: a.monthlyPriceCents, quantity: body.quantity, recurring: "month" };
      mode = "subscription";
      code = "extra_number";
    } else if (body.addon === "minutes_250") {
      const a = ADD_ONS.minutes_250;
      line = { name: fr ? a.name.fr : a.name.en, description: taxNote, unitAmountCents: a.priceCents, quantity: body.quantity };
      mode = "payment";
      code = "minutes_250";
    } else {
      if ((await getPlan(repo, account.id)) === "free") throw forbidden("intl_requires_paid_plan");
      const a = ADD_ONS.intl_credit_min;
      line = { name: fr ? a.name.fr : a.name.en, description: taxNote, unitAmountCents: body.amountCents ?? a.priceCents, quantity: 1 };
      mode = "payment";
      code = "intl_credit";
    }

    const customerId = account.stripeCustomerId ?? (await createCustomer(account, user.email, user.displayName, user.locale));
    const session = await deps.billing.createCheckout({
      customerId,
      mode,
      line,
      metadata: { telecom_account_id: account.id, kind: body.plan ? "plan" : "addon", code },
      successUrl: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/billing/cancel`,
      locale: user.locale,
    });
    return { checkoutUrl: session.url, sessionId: session.id };
  });

  async function createCustomer(account: TelecomAccount, email: string | null, name: string | null, locale: string) {
    const id = await deps.billing!.createCustomer({ accountId: account.id, email, name, locale });
    await repo.updateAccount(account.id, { stripeCustomerId: id });
    return id;
  }

  app.get("/v1/billing/portal", auth, async (req): Promise<BillingPortalResponse> => {
    const { account } = await loadContext(deps, req);
    if (!deps.billing) throw notConfigured("Billing");
    if (!account.stripeCustomerId) throw conflict("no_billing_account");
    return { portalUrl: await deps.billing.createPortal(account.stripeCustomerId, `${appUrl}/settings/billing`) };
  });

  // TODO: verify App Store (App Store Server API, signed transactions) and Google Play (Play Developer API purchases.subscriptionsv2)
  // receipts, then upsert a subscription with source "iap_apple"/"iap_google" and call recomputeEntitlements.
  app.post("/v1/billing/iap/verify", auth, async (_req, reply) =>
    reply.code(501).send({ error: "not_implemented", message: "In-app purchase verification is not implemented yet" }),
  );

  // Stripe webhook: needs the raw body for signature verification, so JSON parsing is overridden in this scope only.
  await app.register(async (scope) => {
    scope.removeContentTypeParser("application/json");
    scope.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => done(null, body));

    scope.post("/webhooks/stripe", { config: { rateLimit: false } }, async (req, reply) => {
      if (!deps.billing) throw notConfigured("Billing");
      const signature = req.headers["stripe-signature"];
      if (typeof signature !== "string" || !Buffer.isBuffer(req.body)) throw new HttpError(400, "invalid_signature");
      let event: Stripe.Event;
      try {
        event = deps.billing.constructEvent(req.body, signature);
      } catch {
        throw new HttpError(400, "invalid_signature", "Stripe signature verification failed");
      }
      if (!(await repo.useOnce(`stripe:${event.id}`, addDays(deps.now(), 30)))) return reply.code(200).send({ received: true, duplicate: true });
      await handleStripeEvent(event);
      return { received: true };
    });
  });

  async function accountFor(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null, metadata?: Stripe.Metadata | null) {
    const byMeta = metadata?.telecom_account_id ? await repo.getAccount(metadata.telecom_account_id) : null;
    if (byMeta) return byMeta;
    const id = typeof customer === "string" ? customer : customer?.id;
    return id ? repo.findAccountByStripeCustomer(id) : null;
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const account = await accountFor(sub.customer, sub.metadata);
    if (!account) return app.log.warn({ subscription: sub.id }, "Stripe subscription for unknown account");
    const kind = sub.metadata.kind === "addon" ? "addon" : "plan";
    const code = sub.metadata.code ?? "free";
    if (kind === "plan" && !(code in PLANS)) return app.log.warn({ subscription: sub.id, code }, "Stripe subscription with unknown plan");
    const item = sub.items.data[0];
    const periodEnd = item?.current_period_end;
    await repo.upsertSubscription({
      telecomAccountId: account.id,
      kind,
      code: kind === "plan" ? (code as PlanCode) : code,
      quantity: item?.quantity ?? 1,
      stripeSubscriptionId: sub.id,
      status: SUB_STATUSES.has(sub.status as Subscription["status"]) ? (sub.status as Subscription["status"]) : "incomplete",
      source: "stripe",
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    });
    await recomputeEntitlements(repo, account);
  }

  async function handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const account = await accountFor(s.customer, s.metadata);
        if (!account) return app.log.warn({ session: s.id }, "Checkout for unknown account");
        if (s.mode === "subscription" && typeof s.subscription === "string") {
          await syncSubscription(await deps.billing!.retrieveSubscription(s.subscription));
        } else if (s.mode === "payment" && s.payment_status === "paid") {
          if (s.metadata?.code === "minutes_250") {
            const packs = Math.max(1, Math.round((s.amount_subtotal ?? ADD_ONS.minutes_250.priceCents) / ADD_ONS.minutes_250.priceCents));
            await repo.addUsage(account.id, usagePeriods(deps.now()).slice(0, 1), { bonusMinutesOut: 250 * packs });
          } else if (s.metadata?.code === "intl_credit") {
            await repo.addIntlCredit(account.id, s.amount_subtotal ?? 0);
            await repo.replaceEntitlements(account.id, "intl_credit", [{ feature: "intl_calling", limit: null }]);
            await recomputeEntitlements(repo, account);
          }
        }
        await repo.audit({ actorUserId: null, action: "billing.checkout_completed", targetType: "telecom_account", targetId: account.id, meta: { code: s.metadata?.code } });
        return;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        return syncSubscription(event.data.object);
      default:
        return;
    }
  }
}
