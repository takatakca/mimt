import Stripe from "stripe";

export interface CheckoutLine {
  name: string;
  description: string;
  unitAmountCents: number;
  quantity: number;
  recurring?: "month" | "year";
}

export interface BillingGateway {
  createCustomer(input: { accountId: string; email: string | null; name: string | null; locale: string }): Promise<string>;
  createCheckout(input: {
    customerId: string;
    mode: "subscription" | "payment";
    line: CheckoutLine;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
    locale: "fr-CA" | "en-CA";
  }): Promise<{ id: string; url: string }>;
  createPortal(customerId: string, returnUrl: string): Promise<string>;
  /** Verifies the Stripe-Signature header against the raw body. Throws on mismatch. */
  constructEvent(rawBody: Buffer, signature: string): Stripe.Event;
  retrieveSubscription(id: string): Promise<Stripe.Subscription>;
}

export class StripeGateway implements BillingGateway {
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
  ) {
    this.stripe = new Stripe(secretKey, { maxNetworkRetries: 2, appInfo: { name: "mimt-api" } });
  }

  async createCustomer(input: { accountId: string; email: string | null; name: string | null; locale: string }) {
    const c = await this.stripe.customers.create({
      ...(input.email ? { email: input.email } : {}),
      ...(input.name ? { name: input.name } : {}),
      preferred_locales: [input.locale.startsWith("fr") ? "fr-CA" : "en"],
      metadata: { telecom_account_id: input.accountId },
    });
    return c.id;
  }

  async createCheckout(input: Parameters<BillingGateway["createCheckout"]>[0]) {
    const { line } = input;
    const session = await this.stripe.checkout.sessions.create({
      mode: input.mode,
      customer: input.customerId,
      client_reference_id: input.metadata.telecom_account_id,
      locale: input.locale === "fr-CA" ? "fr-CA" : "en",
      currency: "cad",
      // Taxes: Stripe Tax is off until GST/QST registration is done (MIMT-REGULATORY.md §11).
      automatic_tax: { enabled: false },
      line_items: [
        {
          quantity: line.quantity,
          price_data: {
            currency: "cad",
            unit_amount: line.unitAmountCents,
            product_data: { name: line.name, description: line.description },
            ...(line.recurring ? { recurring: { interval: line.recurring } } : {}),
          },
        },
      ],
      custom_text: {
        submit: {
          message:
            input.locale === "fr-CA"
              ? "Prix avant taxes. La TPS, la TVQ et la taxe municipale 9-1-1 du Québec s'appliquent selon votre adresse."
              : "Prices before taxes. GST, QST and the Quebec municipal 9-1-1 tax apply based on your address.",
        },
      },
      metadata: input.metadata,
      ...(input.mode === "subscription" ? { subscription_data: { metadata: input.metadata } } : { payment_intent_data: { metadata: input.metadata } }),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return { id: session.id, url: session.url };
  }

  async createPortal(customerId: string, returnUrl: string) {
    const s = await this.stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return s.url;
  }

  constructEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  retrieveSubscription(id: string) {
    return this.stripe.subscriptions.retrieve(id);
  }
}
