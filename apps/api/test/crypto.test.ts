import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { MessageCipher, safeEqual, signWebhook } from "../src/lib/crypto.js";

describe("message encryption (AES-256-GCM)", () => {
  const cipher = new MessageCipher(MessageCipher.generateKey());

  it("round-trips UTF-8 text with a fresh IV each time", () => {
    const text = "Allô! Ça marche? 🎉";
    const a = cipher.encrypt(text);
    const b = cipher.encrypt(text);
    expect(a).not.toBe(b);
    expect(a).not.toContain("Allô");
    expect(cipher.decrypt(a)).toBe(text);
    expect(cipher.decrypt(cipher.encrypt(""))).toBe("");
  });

  it("detects tampering and wrong keys", () => {
    const ct = cipher.encrypt("secret");
    const raw = Buffer.from(ct.slice(3), "base64url");
    raw[raw.length - 1]! ^= 1;
    expect(() => cipher.decrypt("v1." + raw.toString("base64url"))).toThrow();
    expect(() => new MessageCipher(MessageCipher.generateKey()).decrypt(ct)).toThrow();
  });

  it("rejects keys that are not 32 bytes", () => {
    expect(() => new MessageCipher(Buffer.alloc(16).toString("base64"))).toThrow(/32 bytes/);
  });

  it("fingerprints normalized bodies without revealing them", () => {
    expect(cipher.fingerprint("Promo  Incroyable ")).toBe(cipher.fingerprint("promo incroyable"));
    expect(cipher.fingerprint("a")).not.toBe(cipher.fingerprint("b"));
  });
});

describe("helpers", () => {
  it("signs TAKATAK webhooks as t=..,v1=HMAC(t.body)", () => {
    const header = signWebhook("s3cret", '{"a":1}', 1700000000);
    const expected = createHmac("sha256", "s3cret").update('1700000000.{"a":1}').digest("hex");
    expect(header).toBe(`t=1700000000,v1=${expected}`);
  });

  it("compares strings in constant time", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
