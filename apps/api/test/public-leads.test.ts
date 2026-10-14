import { describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

const origin = { origin: "https://mimt.ca" };
const request = {
  form: "waitlist",
  locale: "fr-CA",
  fields: { email: "Client@Example.ca", interest: "mobile" },
  consents: { marketing: false, marketingText: "Facultatif : je consens aux nouvelles de MIMT" },
  page: "/",
  submittedAt: "2026-10-14T12:00:00Z",
};

describe("public website leads", () => {
  it("persists a validated interest request without exposing personal data in the response", async () => {
    const { app, repo } = await setup();
    const response = await app.inject({ method: "POST", url: "/v1/public/leads", headers: origin, payload: request });
    expect(response.statusCode).toBe(202);
    expect(response.json()).toEqual({ accepted: true });
    expect(repo.publicLeads).toHaveLength(1);
    expect(repo.publicLeads[0]).toMatchObject({
      formKind: "waitlist", locale: "fr-CA", email: "client@example.ca",
      marketingOptInRequested: false, marketingText: "",
    });
    await app.close();
  });

  it("rejects external origins and missing origins", async () => {
    const { app, repo } = await setup();
    for (const headers of [{ origin: "https://evil.example" }, {}]) {
      const r = await app.inject({ method: "POST", url: "/v1/public/leads", headers, payload: request });
      expect(r.statusCode).toBe(403);
    }
    expect(repo.publicLeads).toHaveLength(0);
    await app.close();
  });

  it("validates mandatory form fields and ignores marketing consent when unchecked", async () => {
    const { app, repo } = await setup();
    const invalid = await app.inject({ method: "POST", url: "/v1/public/leads", headers: origin,
      payload: { ...request, fields: { email: "not-an-email", interest: "mobile" } } });
    expect(invalid.statusCode).toBe(400);
    const demo = await app.inject({ method: "POST", url: "/v1/public/leads", headers: origin,
      payload: { ...request, form: "demo", fields: { name: "Jean", company: "MIMT", email: "jean@example.ca", phone: "", lines: "4", message: "" },
        consents: { marketing: true, marketingText: "Facultatif : j'accepte de recevoir des nouvelles et des offres de MIMT." } } });
    expect(demo.statusCode).toBe(202);
    expect(repo.publicLeads[0]?.marketingOptInRequested).toBe(true);
    expect(repo.publicLeads).toHaveLength(1);
    await app.close();
  });

  it("throttles repeated submissions from one email", async () => {
    const { app, repo } = await setup();
    const statuses: number[] = [];
    for (let n = 0; n < 4; n++) {
      const r = await app.inject({ method: "POST", url: "/v1/public/leads", headers: origin, payload: request });
      statuses.push(r.statusCode);
    }
    expect(statuses).toEqual([202, 202, 202, 429]);
    expect(repo.publicLeads).toHaveLength(3);
    await app.close();
  });
});
