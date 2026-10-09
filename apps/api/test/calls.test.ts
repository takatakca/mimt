import type { CallsResponse } from "@mimt/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeUser, setup, type Ctx } from "./helpers.js";

let ctx: Ctx;
beforeEach(async () => {
  ctx = await setup();
});
afterEach(() => ctx.app.close());

const T0 = Date.UTC(2026, 9, 1, 12);

async function call(accountId: string, sid: string, i: number, over: Partial<Parameters<Ctx["repo"]["upsertCall"]>[0]> = {}) {
  const c = await ctx.repo.upsertCall({
    twilioCallSid: sid,
    telecomAccountId: accountId,
    userId: null,
    direction: "outbound",
    kind: "pstn",
    fromNumber: "+15145550100",
    toNumber: "+14165550123",
    status: "completed",
    startedAt: new Date(T0 + i * 60_000),
    ...over,
  });
  return c;
}

describe("GET /v1/calls (recents)", () => {
  it("requires a session", async () => {
    expect((await ctx.app.inject({ url: "/v1/calls" })).statusCode).toBe(401);
  });

  it("lists only the caller's own calls, newest first, with the fields the app shows", async () => {
    const me = await makeUser(ctx, { number: "+15145550100" });
    const other = await makeUser(ctx, { number: "+15145550111" });
    await call(me.account.id, "CA-out", 0);
    const inbound = await call(me.account.id, "CA-in", 1, { direction: "inbound", fromNumber: "+14385550000", toNumber: "+15145550100" });
    await ctx.repo.updateCall(inbound.id, { durationS: 42, endedAt: new Date(T0 + 120_000) });
    await call(me.account.id, "CA-911", 2, { kind: "emergency", toNumber: "911" });
    await call(other.account.id, "CA-other", 3);

    const res = await ctx.app.inject({ url: "/v1/calls", headers: me.auth });
    expect(res.statusCode).toBe(200);
    const body = res.json<CallsResponse>();
    expect(body.nextCursor).toBeNull();
    expect(body.calls.map((c) => c.peer)).toEqual(["911", "+14385550000", "+14165550123"]);
    expect(body.calls[1]).toEqual({
      id: inbound.id,
      direction: "inbound",
      kind: "pstn",
      peer: "+14385550000",
      ourNumber: "+15145550100",
      status: "completed",
      startedAt: new Date(T0 + 60_000).toISOString(),
      endedAt: new Date(T0 + 120_000).toISOString(),
      durationS: 42,
      missed: false,
    });
    expect(JSON.stringify(body)).not.toContain("CA-");
  });

  it("marks unanswered inbound calls and calls that went to voicemail as missed", async () => {
    const me = await makeUser(ctx, { number: "+15145550100" });
    const inbound = { direction: "inbound" as const, fromNumber: "+14385550000", toNumber: "+15145550100" };
    await call(me.account.id, "CA-noanswer", 0, { ...inbound, status: "no-answer" });
    await call(me.account.id, "CA-vm", 1, inbound);
    await call(me.account.id, "CA-answered", 2, inbound);
    await call(me.account.id, "CA-out-busy", 3, { status: "busy" });
    await ctx.repo.createVoicemail({
      telecomAccountId: me.account.id, phoneNumberId: me.number!.id, callSid: "CA-vm", recordingSid: "RE1", fromNumber: "+14385550000", audioUrl: null, durationS: 3,
    });
    const calls = (await ctx.app.inject({ url: "/v1/calls", headers: me.auth })).json<CallsResponse>().calls;
    expect(calls.map((c) => c.missed)).toEqual([false, false, true, true]);
  });

  it("paginates with an opaque cursor and validates it", async () => {
    const me = await makeUser(ctx);
    for (let i = 0; i < 5; i++) await call(me.account.id, `CA${i}`, i, { toNumber: `+1416555010${i}` });
    const p1 = (await ctx.app.inject({ url: "/v1/calls?limit=2", headers: me.auth })).json<CallsResponse>();
    expect(p1.calls.map((c) => c.peer)).toEqual(["+14165550104", "+14165550103"]);
    const p2 = (await ctx.app.inject({ url: `/v1/calls?limit=2&cursor=${p1.nextCursor}`, headers: me.auth })).json<CallsResponse>();
    expect(p2.calls.map((c) => c.peer)).toEqual(["+14165550102", "+14165550101"]);
    const p3 = (await ctx.app.inject({ url: `/v1/calls?limit=2&cursor=${p2.nextCursor}`, headers: me.auth })).json<CallsResponse>();
    expect(p3).toMatchObject({ calls: [{ peer: "+14165550100" }], nextCursor: null });

    const bad = await ctx.app.inject({ url: "/v1/calls?cursor=nonsense", headers: me.auth });
    expect(bad.statusCode).toBe(400);
    expect(bad.json()).toEqual({ error: "invalid_cursor", message: "invalid_cursor" });
    expect((await ctx.app.inject({ url: "/v1/calls?limit=1000", headers: me.auth })).statusCode).toBe(400);
  });
});
