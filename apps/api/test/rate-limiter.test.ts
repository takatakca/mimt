import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "../src/fraud/rateLimiter.js";

describe("single-instance fraud limiter safety", () => {
  it("refills after the configured window and never grants extra tokens when the clock goes backwards", async () => {
    let now = 10_000;
    const limiter = new InMemoryRateLimiter(() => now);
    const rule = { capacity: 2, windowSeconds: 10 };
    expect(await limiter.take("user", rule)).toBe(true);
    expect(await limiter.take("user", rule)).toBe(true);
    now = 9_000;
    expect(await limiter.take("user", rule)).toBe(false);
    now = 15_000;
    expect(await limiter.take("user", rule)).toBe(true);
    expect(await limiter.take("user", rule)).toBe(false);
    now = 20_000;
    expect(await limiter.take("user", rule)).toBe(true);
  });

  it("bounds unique-key memory and keeps existing buckets functional", async () => {
    let now = 0;
    const limiter = new InMemoryRateLimiter(() => now, 2);
    const rule = { capacity: 2, windowSeconds: 60 };
    expect(await limiter.take("a", rule)).toBe(true);
    expect(await limiter.take("b", rule)).toBe(true);
    expect(await limiter.take("c", rule)).toBe(false);
    expect(await limiter.take("a", rule)).toBe(true);
    expect(await limiter.take("a", rule)).toBe(false);
    now = 86_400_001;
    expect(await limiter.take("c", rule)).toBe(true);
  });

  it("fails closed for invalid policies, costs and clocks", async () => {
    const limiter = new InMemoryRateLimiter();
    const rule = { capacity: 2, windowSeconds: 60 };
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(await limiter.take("invalid", { ...rule, capacity: bad })).toBe(false);
      expect(await limiter.take("invalid", { ...rule, windowSeconds: bad })).toBe(false);
      expect(await limiter.take("invalid", rule, bad)).toBe(false);
    }
    expect(await new InMemoryRateLimiter(() => Number.NaN).take("invalid", rule)).toBe(false);
    expect(() => new InMemoryRateLimiter(Date.now, 0)).toThrow(/maxBuckets/);
    expect(await limiter.take("valid", rule)).toBe(true);
  });
});
