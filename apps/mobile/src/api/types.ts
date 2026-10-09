// Request/response shapes used by the app. The contract shared with apps/api lives in @mimt/shared;
// the ones below are app-specific and should move to @mimt/shared once the API implements them.
export type { ApiError, E911Address, Locale, MeResponse, SendMessageRequest, VoiceTokenResponse } from "@mimt/shared";
import type { PlanCode } from "@mimt/shared";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
}

export interface TakatakExchangeRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface OtpStartRequest {
  phone: string;
}
export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface E911Notice {
  version: string;
  locale: "fr-CA" | "en-CA";
  title: string;
  /** Plain text, paragraphs separated by blank lines. */
  body: string;
}

export interface E911AckRequest {
  noticeVersion: string;
  appVersion: string;
}

export interface AvailableNumber {
  e164: string;
  locality?: string;
  region?: string;
}

export interface Conversation {
  id: string;
  peer: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  mediaUrls?: string[];
  status: "queued" | "sent" | "delivered" | "failed" | "received";
  at: string;
}

export interface CallRecord {
  id: string;
  direction: "inbound" | "outbound";
  peer: string;
  startedAt: string;
  durationS: number;
  missed: boolean;
}

export interface Voicemail {
  id: string;
  from: string;
  receivedAt: string;
  durationS: number;
  /** Short-lived signed URL to the audio file. */
  audioUrl: string;
  transcript: string | null;
}

export interface CheckoutRequest {
  plan: PlanCode;
  returnUrl: string;
}

export type ConsentKind = "ads_personalised" | "casl_marketing";
export interface ConsentRequest {
  kind: ConsentKind;
  granted: boolean;
  version: string;
  source: "mobile";
}
