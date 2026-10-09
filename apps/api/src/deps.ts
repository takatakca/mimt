import type { Config } from "./config.js";
import type { SessionService } from "./auth/sessions.js";
import type { TakatakClient } from "./auth/takatak.js";
import type { BillingGateway } from "./gateways/billing.js";
import type { TwilioGateway } from "./gateways/twilio.js";
import type { MessageCipher } from "./lib/crypto.js";
import type { RateLimiter } from "./fraud/rateLimiter.js";
import type { Repository } from "./repo/types.js";
import type { Notifier } from "./services/notifier.js";

export interface AppDeps {
  config: Config;
  repo: Repository;
  sessions: SessionService;
  takatak: TakatakClient;
  /** null when Twilio REST credentials are not configured (features answer 503). */
  twilio: TwilioGateway | null;
  /** null when Stripe is not configured. */
  billing: BillingGateway | null;
  cipher: MessageCipher;
  rateLimiter: RateLimiter;
  notifier: Notifier;
  now: () => Date;
}
