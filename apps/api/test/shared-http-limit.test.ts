import { describe, expect, it, vi } from "vitest";
import { setup } from "./helpers.js";

describe("shared HTTP abuse guard", () => {
  it("blocks ordinary requests when the shared limiter denies them, without reaching a handler", async () => {
    const { app, deps } = await setup();
    try {
      const take = vi.spyOn(deps.rateLimiter, "take").mockResolvedValue(false);
      const reply = await app.inject({ method: "GET", url: "/v1/me" });
      expect(reply.statusCode).toBe(429);
      expect(reply.json()).toEqual({ error: "rate_limited", message: "Too many requests; try again later" });
      expect(take).toHaveBeenCalledWith("http:ip:127.0.0.1", { capacity: 300, windowSeconds: 60 });
    } finally {
      await app.close();
    }
  });

  it("preserves health and emergency address/notice endpoints during shared limiter outage", async () => {
    const { app, deps } = await setup();
    try {
      const take = vi.spyOn(deps.rateLimiter, "take").mockResolvedValue(false);
      const health = await app.inject({ method: "GET", url: "/healthz" });
      expect(health.statusCode).toBe(200);
      const ready = await app.inject({ method: "GET", url: "/readyz" });
      expect(ready.statusCode).toBe(200);
      const notice = await app.inject({ method: "GET", url: "/v1/e911/notice?locale=en-CA" });
      expect(notice.statusCode).toBe(200);
      const addr = await app.inject({ method: "GET", url: "/v1/e911/address" });
      expect(addr.statusCode).toBe(401);
      expect(take).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it("preserves signed carrier callbacks but rate-limits unknown /webhooks/* routes", async () => {
    const { app, deps } = await setup();
    try {
      const take = vi.spyOn(deps.rateLimiter, "take").mockResolvedValue(false);
      // Invalid signature is rejected by the webhook handler, not the HTTP limiter.
      const callback = await app.inject({ method: "POST", url: "/webhooks/twilio/voice/outbound", payload: {} });
      expect(callback.statusCode).toBe(403);
      expect(take).not.toHaveBeenCalled();
      const unknown = await app.inject({ method: "GET", url: "/webhooks/not-registered" });
      expect(unknown.statusCode).toBe(429);
      expect(take).toHaveBeenCalledOnce();
    } finally {
      await app.close();
    }
  });

  it("groups regular requests under one per-IP key independent of the route", async () => {
    const { app, deps } = await setup();
    try {
      const keys: string[] = [];
      vi.spyOn(deps.rateLimiter, "take").mockImplementation(async (key) => {
        keys.push(key);
        return true;
      });
      const a = await app.inject({ method: "GET", url: "/v1/me" });
      const b = await app.inject({ method: "GET", url: "/v1/numbers" });
      expect([a.statusCode, b.statusCode]).not.toContain(429);
      expect(keys).toEqual(["http:ip:127.0.0.1", "http:ip:127.0.0.1"]);
    } finally {
      await app.close();
    }
  });
});
