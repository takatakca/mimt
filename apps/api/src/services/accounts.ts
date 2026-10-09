import { PLANS, type Feature, type PlanCode } from "@mimt/shared";
import type { AccountStatus, Repository, Subscription, TelecomAccount, User } from "../repo/types.js";
import { dayPeriod, monthPeriod } from "../lib/time.js";

const PLAN_RANK: PlanCode[] = ["free", "lock", "premium", "business", "business_pro"];
const LIVE_STATUSES = new Set<Subscription["status"]>(["active", "trialing", "past_due"]);

export async function ensureAccount(repo: Repository, user: User): Promise<TelecomAccount> {
  const existing = await repo.getAccountByOwner(user.id);
  if (existing) return existing;
  return repo.createAccount({
    ownerUserId: user.id,
    kind: "consumer",
    status: user.globalUserId ? "ACTIVE_MANAGED" : "ACTIVE_INDEPENDENT",
    riskTier: "new",
  });
}

export function planFromSubscriptions(subs: Subscription[]): PlanCode {
  let best: PlanCode = "free";
  for (const s of subs) {
    if (s.kind !== "plan" || !LIVE_STATUSES.has(s.status) || !(s.code in PLANS)) continue;
    const code = s.code as PlanCode;
    if (PLAN_RANK.indexOf(code) > PLAN_RANK.indexOf(best)) best = code;
  }
  return best;
}

export async function getPlan(repo: Repository, accountId: string): Promise<PlanCode> {
  return planFromSubscriptions(await repo.listSubscriptions(accountId));
}

export interface AccountFeatures {
  plan: PlanCode;
  features: Set<Feature>;
  extraNumbers: number;
}

export async function getFeatures(repo: Repository, accountId: string): Promise<AccountFeatures> {
  const [plan, ents] = await Promise.all([getPlan(repo, accountId), repo.listEntitlements(accountId)]);
  const features = new Set<Feature>(PLANS[plan].features);
  let extraNumbers = 0;
  for (const e of ents) {
    features.add(e.feature);
    if (e.feature === "extra_number") extraNumbers += e.limit ?? 1;
  }
  return { plan, features, extraNumbers };
}

/** Rebuilds plan/add-on entitlements from subscriptions and tells TAKATAK. */
export async function recomputeEntitlements(repo: Repository, account: TelecomAccount): Promise<void> {
  const subs = await repo.listSubscriptions(account.id);
  const plan = planFromSubscriptions(subs);
  await repo.replaceEntitlements(
    account.id,
    "plan",
    PLANS[plan].features.map((feature) => ({ feature, limit: null })),
  );
  const extra = subs
    .filter((s) => s.kind === "addon" && s.code === "extra_number" && LIVE_STATUSES.has(s.status))
    .reduce((n, s) => n + s.quantity, 0);
  await repo.replaceEntitlements(account.id, "addon", extra ? [{ feature: "extra_number", limit: extra }] : []);
  const { features } = await getFeatures(repo, account.id);
  const owner = await repo.getUser(account.ownerUserId);
  await repo.enqueueOutbox("entitlement.updated", {
    telecom_account_id: account.id,
    global_user_id: owner?.globalUserId ?? null,
    workspace_id: account.workspaceId,
    plan,
    features: [...features].sort(),
  });
}

export async function setAccountStatus(repo: Repository, account: TelecomAccount, status: AccountStatus, reason: string): Promise<TelecomAccount> {
  if (account.status === status) return account;
  const updated = await repo.updateAccount(account.id, { status });
  const owner = await repo.getUser(account.ownerUserId);
  await repo.enqueueOutbox("telecom_account.status_changed", {
    telecom_account_id: account.id,
    global_user_id: owner?.globalUserId ?? null,
    workspace_id: account.workspaceId,
    status,
    previous_status: account.status,
    reason,
  });
  await repo.audit({ actorUserId: null, action: "account.status_changed", targetType: "telecom_account", targetId: account.id, meta: { status, reason } });
  return updated;
}

/** Usage is written to the month row (caps) and the day row (daily spend guard). Periods are UTC. */
export const usagePeriods = (at: Date) => [monthPeriod(at), dayPeriod(at)];

export const outboundBlocked = (a: TelecomAccount) => a.status === "OUTBOUND_SUSPENDED" || a.status === "SUSPENDED" || a.status === "CLOSED";

/** Numbers that still belong to the user (quarantined/released ones do not). */
export const HELD_STATES = new Set(["active", "locked", "grace", "porting_in"]);
