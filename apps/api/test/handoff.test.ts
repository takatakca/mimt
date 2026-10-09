import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { API_KEY, handoffJwt, makeUser, setup, type Ctx } from "./helpers.js";

let ctx: Ctx;
beforeEach(async () => {
  ctx = await setup();
});
afterEach(() => ctx.app.close());

const body = { global_user_id: "gu_123", workspace_id: "ws_1", business_id: "biz_9", plan_hint: "premium", locale: "fr-CA" };
const activate = (token: string, payload: object = body) =>
  ctx.app.inject({ method: "POST", url: "/v1/handoff/activations", headers: { authorization: `Bearer ${token}` }, payload });

describe("TAKATAK handoff activation (Flow B)", () => {
  it("accepts a valid TAKATAK-signed JWT and returns an opaque single-use handoff id", async () => {
    const res = await activate(await handoffJwt(ctx.keys.privateKey, { sub: "gu_123" }));
    expect(res.statusCode).toBe(201);
    const { handoff_id, expires_at } = res.json();
    expect(handoff_id).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(new Date(expires_at).getTime() - Date.now()).toBeLessThanOrEqual(120_000);
    // Stored hashed, never in clear.
    expect([...ctx.repo.handoffs.values()][0]!.tokenHash).not.toBe(handoff_id);
  });

  it("rejects a replayed jti", async () => {
    const token = await handoffJwt(ctx.keys.privateKey, { sub: "gu_123" });
    expect((await activate(token)).statusCode).toBe(201);
    const replay = await activate(token);
    expect(replay.statusCode).toBe(401);
    expect(replay.json().message).toMatch(/already used/);
  });

  it("rejects wrong audience, wrong issuer, long lifetime, foreign keys and subject mismatch", async () => {
    const { privateKey } = ctx.keys;
    expect((await activate(await handoffJwt(privateKey, { sub: "gu_123", aud: "other" }))).statusCode).toBe(401);
    expect((await activate(await handoffJwt(privateKey, { sub: "gu_123", iss: "https://evil.test" }))).statusCode).toBe(401);
    expect((await activate(await handoffJwt(privateKey, { sub: "gu_123", ttl: 300 }))).statusCode).toBe(401);
    expect((await activate(await handoffJwt(privateKey, { sub: "someone_else" }))).statusCode).toBe(401);
    const { privateKey: foreign } = await (await import("./helpers.js")).takatakKeys();
    expect((await activate(await handoffJwt(foreign, { sub: "gu_123" }))).statusCode).toBe(401);
    expect((await ctx.app.inject({ method: "POST", url: "/v1/handoff/activations", payload: body })).statusCode).toBe(401);
  });

  it("lets only the matching MIMT user claim it, once", async () => {
    const { handoff_id } = (await activate(await handoffJwt(ctx.keys.privateKey, { sub: "gu_123" }))).json();
    const other = await makeUser(ctx, { globalUserId: "gu_other" });
    const owner = await makeUser(ctx, { globalUserId: "gu_123" });
    const claim = (auth: Record<string, string>) => ctx.app.inject({ method: "POST", url: "/v1/handoff/claim", headers: auth, payload: { handoffId: handoff_id } });

    expect((await claim(other.auth)).statusCode).toBe(403);
    const ok = await claim(owner.auth);
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ workspaceId: "ws_1", businessId: "biz_9", planHint: "premium", status: "ACTIVE_MANAGED" });
    expect((await claim(owner.auth)).statusCode).toBe(409);
    expect(ctx.repo.outbox.map((e) => e.eventType)).toContain("telecom_account.status_changed");
  });

  it("refuses an expired handoff", async () => {
    const { handoff_id } = (await activate(await handoffJwt(ctx.keys.privateKey, { sub: "gu_123" }))).json();
    const owner = await makeUser(ctx, { globalUserId: "gu_123" });
    ctx.deps.now = () => new Date(Date.now() + 3 * 60_000);
    const res = await ctx.app.inject({ method: "POST", url: "/v1/handoff/claim", headers: owner.auth, payload: { handoffId: handoff_id } });
    expect(res.json().error).toBe("handoff_expired");
  });
});

describe("TAKATAK overview", () => {
  it("requires the API key and returns plan, numbers and status without message content", async () => {
    const u = await makeUser(ctx, { globalUserId: "gu_123", number: "+15145550100", e911: true });
    const url = "/v1/takatak/overview?global_user_id=gu_123";
    expect((await ctx.app.inject({ url })).statusCode).toBe(401);
    expect((await ctx.app.inject({ url, headers: { "x-mimt-api-key": "wrong" } })).statusCode).toBe(401);
    const res = await ctx.app.inject({ url, headers: { "x-mimt-api-key": API_KEY } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      connected: true,
      telecom_account_id: u.account.id,
      plan: "free",
      e911_registered: true,
      numbers: [{ e164: "+15145550100", state: "active" }],
    });
    expect(JSON.stringify(res.json())).not.toMatch(/body|message/i);
  });
});
