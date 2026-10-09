// Shared API contract between apps/api, apps/mobile and apps/web.

import type { NumberState } from "./numbers.js";
import type { PlanCode } from "./plans.js";

export type Locale = "fr-CA" | "en-CA";

export interface MeResponse {
  user: { id: string; globalUserId: string | null; locale: Locale; displayName: string | null };
  account: { id: string; kind: "consumer" | "business"; plan: PlanCode; status: string };
  numbers: Array<{ id: string; e164: string; state: NumberState }>;
  e911: { addressRegistered: boolean; noticeAccepted: boolean; noticeVersion: string };
  usage: { outboundMinutes: number; inboundMinutes: number; outboundSms: number; periodStart: string };
}

export interface E911Address {
  street: string;
  unit?: string;
  city: string;
  province: string;
  postalCode: string;
  country: "CA";
}

export interface VoiceTokenResponse {
  token: string;
  identity: string;
  expiresAt: string;
}

export interface SendMessageRequest {
  from: string;
  to: string;
  body: string;
}

export interface ApiError {
  error: string;
  message: string;
}
