import { PLANS, type PlanCaps, type PlanCode } from "@mimt/shared";
import type { RiskTier, Usage } from "../repo/types.js";
import { daysBetween } from "../lib/time.js";

export const NEW_ACCOUNT_DAYS = 14;

/** Plan caps adjusted for risk: new accounts (first 14 days, or tier "new"/"high") get half the outbound caps. */
export function effectiveCaps(plan: PlanCode, riskTier: RiskTier, accountCreatedAt: Date, now: Date): PlanCaps {
  const caps = PLANS[plan].caps;
  const young = daysBetween(accountCreatedAt, now) < NEW_ACCOUNT_DAYS && riskTier !== "trusted";
  if (!young && riskTier !== "new" && riskTier !== "high") return caps;
  return {
    ...caps,
    outboundMinutes: Math.floor(caps.outboundMinutes / 2),
    outboundSms: Math.floor(caps.outboundSms / 2),
    concurrentCalls: riskTier === "high" ? 1 : caps.concurrentCalls,
  };
}

export type CapResult = { ok: true; remaining: number } | { ok: false; reason: string };

export function checkVoiceCaps(input: { caps: PlanCaps; usage: Usage; activeCalls: number }): CapResult {
  const { caps, usage } = input;
  if (input.activeCalls >= caps.concurrentCalls) return { ok: false, reason: "too_many_calls" };
  const remaining = caps.outboundMinutes + usage.bonusMinutesOut - usage.minutesOut;
  if (remaining <= 0) return { ok: false, reason: "minutes_exhausted" };
  return { ok: true, remaining };
}

export function checkInboundCaps(input: { caps: PlanCaps; usage: Usage }): CapResult {
  const remaining = input.caps.inboundMinutes - input.usage.minutesIn;
  return remaining > 0 ? { ok: true, remaining } : { ok: false, reason: "inbound_minutes_exhausted" };
}

export function checkSmsCaps(input: { caps: PlanCaps; usage: Usage; segments: number }): CapResult {
  const remaining = input.caps.outboundSms - input.usage.smsOut;
  if (remaining < input.segments) return { ok: false, reason: "sms_exhausted" };
  return { ok: true, remaining: remaining - input.segments };
}

/** Daily spend guard: above the threshold, outbound is suspended until a human reviews it. */
export const exceedsDailySpend = (spendTodayCad: number, limitCad: number) => spendTodayCad > limitCad;
