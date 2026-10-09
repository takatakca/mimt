import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeUser, NOTICE, setup, type Ctx } from "./helpers.js";

let ctx: Ctx;
beforeEach(async () => {
  ctx = await setup();
});
afterEach(() => ctx.app.close());

describe("9-1-1", () => {
  it("serves the bilingual notice, French first, marked for legal review", async () => {
    const res = await ctx.app.inject({ url: "/v1/e911/notice?locale=fr-CA" });
    const n = res.json();
    expect(Object.keys(n).indexOf("fr")).toBeLessThan(Object.keys(n).indexOf("en"));
    expect(n.version).toBe(NOTICE);
    expect(n.reviewStatus).toContain("à valider par l'avocat");
    const fr = n.fr.paragraphs.join(" ");
    expect(fr).toContain("pourrait ne pas être transmise automatiquement");
    expect(fr).toContain("adresse 9-1-1 à jour");
    expect(fr).toContain("panne de courant");
    expect(fr).toContain("centre d'appels");
    expect(fr).toContain("où vous êtes");
  });

  it("GET /v1/e911/address returns the saved address (404 before one exists)", async () => {
    const u = await makeUser(ctx);
    const none = await ctx.app.inject({ url: "/v1/e911/address", headers: u.auth });
    expect(none.statusCode).toBe(404);
    expect(none.json().error).toBe("no_e911_address");
    expect((await ctx.app.inject({ url: "/v1/e911/address" })).statusCode).toBe(401);
    const put = await ctx.app.inject({
      method: "PUT", url: "/v1/e911/address", headers: u.auth,
      payload: { street: "1 rue Saint-Denis", unit: "2", city: "Montréal", province: "QC", postalCode: "H2X 1Y4", country: "CA" },
    });
    const got = await ctx.app.inject({ url: "/v1/e911/address", headers: u.auth });
    expect(got.statusCode).toBe(200);
    expect(got.json()).toEqual(put.json());
    expect(got.json()).toMatchObject({ street: "1 rue Saint-Denis", unit: "2", city: "Montréal", province: "QC", postalCode: "H2X 1Y4", country: "CA" });
  });

  it("validates and normalizes a Canadian civic address, registering it with Twilio", async () => {
    const u = await makeUser(ctx, { number: "+15145550100" });
    const bad = await ctx.app.inject({
      method: "PUT", url: "/v1/e911/address", headers: u.auth,
      payload: { street: "1 rue Saint-Denis", city: "Montréal", province: "QC", postalCode: "12345" },
    });
    expect(bad.statusCode).toBe(400);
    const ok = await ctx.app.inject({
      method: "PUT", url: "/v1/e911/address", headers: u.auth,
      payload: { street: "1 rue Saint-Denis", unit: "2", city: "Montréal", province: "qc", postalCode: "h2x1y4" },
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ province: "QC", postalCode: "H2X 1Y4", validated: true, providerRegistered: true });
    expect(ctx.twilio!.attachEmergencyAddress).toHaveBeenCalledWith("PN-+15145550100", "ADtest");
  });

  it("stores the acknowledgement with version, IP and app version; refuses stale versions", async () => {
    const u = await makeUser(ctx);
    const stale = await ctx.app.inject({ method: "POST", url: "/v1/e911/acknowledge", headers: u.auth, payload: { noticeVersion: "old" } });
    expect(stale.statusCode).toBe(409);
    const ok = await ctx.app.inject({
      method: "POST", url: "/v1/e911/acknowledge", headers: { ...u.auth, "x-app-version": "1.0.3" }, payload: { noticeVersion: NOTICE },
    });
    expect(ok.statusCode).toBe(201);
    expect(await ctx.repo.getLatestE911Ack(u.user.id)).toMatchObject({ noticeVersion: NOTICE, appVersion: "1.0.3", ip: "127.0.0.1" });
  });
});
