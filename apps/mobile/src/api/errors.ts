// Map API and network failures to translated messages (pure, unit-tested).
import type { TKey } from "../i18n/core";

const CODE_TO_KEY: Record<string, TKey> = {
  cap_reached: "error.capReached",
  usage_cap_reached: "error.capReached",
  e911_required: "error.e911Required",
  invalid_code: "error.invalidCode",
  otp_invalid: "error.invalidCode",
  number_unavailable: "error.numberTaken",
  number_taken: "error.numberTaken",
  feature_required: "error.featureRequired",
  plan_required: "error.featureRequired",
  validation_error: "error.validation",
  rate_limited: "error.rateLimited",
};

export function errorKeyFor(status: number | null, code?: string | null): TKey {
  if (code && CODE_TO_KEY[code]) return CODE_TO_KEY[code];
  if (status === null || status === 0) return "error.network";
  if (status === 401) return "error.session";
  if (status === 402) return "error.capReached";
  if (status === 403) return "error.forbidden";
  if (status === 404) return "error.notFound";
  if (status === 400 || status === 422) return "error.validation";
  if (status === 429) return "error.rateLimited";
  if (status >= 500) return "error.server";
  return "error.generic";
}

export class ApiClientError extends Error {
  constructor(
    readonly status: number | null,
    readonly code: string | null,
    readonly key: TKey,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function toErrorKey(e: unknown): TKey {
  return e instanceof ApiClientError ? e.key : "error.generic";
}
