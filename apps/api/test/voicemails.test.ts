import type { VoicemailsResponse } from "@mimt/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUDIO_URL_TTL_S } from "../src/routes/voicemails.js";
import { BASE_URL, makeUser, setup, type Ctx } from "./helpers.js";

let ctx: Ctx;
beforeEach(async () => {
  ctx = await setup();
});
afterEach(() => ctx.app.close());

const SUB = `AC${"1".repeat(32)}`;
const REC = `RE${"a".repeat(32)}`;

async function owner() {
  const u = await makeUser(ctx, { number: "+15145550100" });
  const vm = await ctx.repo.createVoicemail({
    telecomAccountId: u.account.id,
    phoneNumberId: u.number!.id,
    callSid: "CA1",
    recordingSid: REC,
    fromNumber: "+14385550000",
    audioUrl: `https://api.twilio.com/2010-04-01/Accounts/${SUB}/Recordings/${REC}`,
    durationS: 12,
  });
  return { u, vm };
}

/** Path + query of the signed URL (inject() takes paths). */
const local = (url: string) => url.slice(BASE_URL.length);

describe("voicemails", () => {
  it("lists with a short-lived signed audio URL on this API, never the Twilio URL", async () => {
    const { u, vm } = await owner();
    const res = await ctx.app.inject({ url: "/v1/voicemails", headers: u.auth });
    expect(res.statusCode).toBe(200);
    const [item] = res.json<VoicemailsResponse>().voicemails;
    expect(item).toMatchObject({ id: vm.id, from: "+14385550000", durationS: 12, transcript: null, listened: false });
    expect(item!.audioUrl!.startsWith(`${BASE_URL}/v1/voicemails/${vm.id}/audio?token=`)).toBe(true);
    const ttl = (Date.parse(item!.audioUrlExpiresAt!) - Date.now()) / 1000;
    expect(ttl).toBeGreaterThan(AUDIO_URL_TTL_S - 5);
    expect(ttl).toBeLessThanOrEqual(AUDIO_URL_TTL_S + 1);
    expect(res.body).not.toContain("api.twilio.com");
    expect(res.body).not.toContain(REC);
  });

  it("streams audio through the API with the signed URL (server-side Twilio fetch), with byte ranges", async () => {
    const { u, vm } = await owner();
    const url = local((await ctx.app.inject({ url: "/v1/voicemails", headers: u.auth })).json<VoicemailsResponse>().voicemails[0]!.audioUrl!);
    const res = await ctx.app.inject({ url });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("audio/mpeg");
    expect(res.headers["cache-control"]).toBe("private, no-store");
    expect(res.body).toBe("ID3-fake-mp3-audio");
    expect(ctx.twilio!.fetchRecording).toHaveBeenCalledWith({ recordingSid: REC, accountSid: SUB });
    expect((await ctx.repo.getVoicemail(vm.id))?.listenedAt).toBeInstanceOf(Date);

    const part = await ctx.app.inject({ url, headers: { range: "bytes=0-2" } });
    expect(part.statusCode).toBe(206);
    expect(part.headers["content-range"]).toBe("bytes 0-2/18");
    expect(part.body).toBe("ID3");
    expect((await ctx.app.inject({ url, headers: { range: "bytes=99-" } })).statusCode).toBe(416);

    const list = (await ctx.app.inject({ url: "/v1/voicemails", headers: u.auth })).json<VoicemailsResponse>();
    expect(list.voicemails[0]!.listened).toBe(true);
  });

  it("also serves audio to the owner with a Bearer token", async () => {
    const { u, vm } = await owner();
    const res = await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio`, headers: u.auth });
    expect(res.statusCode).toBe(200);
  });

  it("refuses audio without credentials, with a forged or foreign token, and to other users", async () => {
    const { u, vm } = await owner();
    const other = await makeUser(ctx);
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio` })).statusCode).toBe(401);
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio?token=abc` })).statusCode).toBe(403);
    // The access token is not a media token, and a media token for another voicemail does not work.
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio?token=${u.token}` })).statusCode).toBe(403);
    const otherVm = await ctx.repo.createVoicemail({ ...vm, recordingSid: `RE${"b".repeat(32)}`, callSid: "CA2" });
    const { token } = await ctx.deps.sessions.signMedia(`voicemail:${otherVm.id}`, 60);
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio?token=${token}` })).statusCode).toBe(403);
    // A media token is never accepted as a session.
    expect((await ctx.app.inject({ url: "/v1/me", headers: { authorization: `Bearer ${token}` } })).statusCode).toBe(401);
    // Another user gets 404 (no existence leak), for audio and delete alike.
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio`, headers: other.auth })).statusCode).toBe(404);
    expect((await ctx.app.inject({ method: "DELETE", url: `/v1/voicemails/${vm.id}`, headers: other.auth })).statusCode).toBe(404);
    expect(await ctx.repo.getVoicemail(vm.id)).not.toBeNull();
    expect(ctx.twilio!.fetchRecording).not.toHaveBeenCalled();
  });

  it("expired signed URLs are refused", async () => {
    const { vm } = await owner();
    const { token } = await ctx.deps.sessions.signMedia(`voicemail:${vm.id}`, -10);
    expect((await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio?token=${token}` })).statusCode).toBe(403);
  });

  it("answers 502 without leaking details when Twilio fails", async () => {
    const { u, vm } = await owner();
    vi.mocked(ctx.twilio!.fetchRecording).mockRejectedValueOnce(new Error("HTTP 401 for https://user:secret@api.twilio.com"));
    const res = await ctx.app.inject({ url: `/v1/voicemails/${vm.id}/audio`, headers: u.auth });
    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({ error: "audio_unavailable", message: "The recording could not be retrieved" });
  });

  it("deletes the owner's voicemail and its Twilio recording", async () => {
    const { u, vm } = await owner();
    const res = await ctx.app.inject({ method: "DELETE", url: `/v1/voicemails/${vm.id}`, headers: u.auth });
    expect(res.statusCode).toBe(204);
    expect(await ctx.repo.getVoicemail(vm.id)).toBeNull();
    expect(ctx.twilio!.deleteRecording).toHaveBeenCalledWith({ recordingSid: REC, accountSid: SUB });
    expect(ctx.repo.auditLog.some((a) => a.action === "voicemail.deleted" && a.targetId === vm.id)).toBe(true);
    expect((await ctx.app.inject({ method: "DELETE", url: `/v1/voicemails/${vm.id}`, headers: u.auth })).statusCode).toBe(404);
    expect((await ctx.app.inject({ method: "DELETE", url: "/v1/voicemails/not-a-uuid", headers: u.auth })).statusCode).toBe(400);
  });
});
