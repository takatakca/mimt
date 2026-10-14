import { describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

describe("client IP forwarding", () => {
  it("ignores attacker-controlled X-Forwarded-For without a trusted reverse proxy", async () => {
    const { app } = await setup();
    app.get("/_test/proxy-ip", async (req) => ({ ip: req.ip }));
    const response = await app.inject({ url: "/_test/proxy-ip", headers: { "x-forwarded-for": "203.0.113.99" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().ip).toBe("127.0.0.1");
    await app.close();
  });

  it("respects a forwarded client IP only from a configured, trusted gateway", async () => {
    const { app } = await setup({ config: { TRUSTED_PROXY_CIDRS: "127.0.0.1/32" } });
    app.get("/_test/proxy-ip", async (req) => ({ ip: req.ip }));
    const response = await app.inject({ url: "/_test/proxy-ip", headers: { "x-forwarded-for": "203.0.113.99" } });
    expect(response.statusCode).toBe(200);
    expect(response.json().ip).toBe("203.0.113.99");
    await app.close();
  });
});
