import { describe, expect, it } from "vitest";
import { en } from "./en";
import { fr } from "./fr";
import { pickLanguage, translate } from "./core";

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("i18n dictionaries", () => {
  it("fr and en have exactly the same keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });
  it("no empty strings", () => {
    for (const [k, v] of [...Object.entries(fr), ...Object.entries(en)]) expect(v.trim(), k).not.toBe("");
  });
  it("same {placeholders} in both languages", () => {
    for (const key of Object.keys(fr) as (keyof typeof fr)[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(fr[key]));
    }
  });
  it("uses Quebec French vocabulary", () => {
    const all = Object.values(fr).join(" ").toLowerCase();
    expect(all).not.toMatch(/\be-?mail\b|\bsms\b(?! )|\bvoicemail\b/);
    expect(fr["tabs.voicemail"]).toBe("Messagerie vocale");
  });
  it("has the 9-1-1 emergency banner text", () => {
    expect(fr["call.emergencyBanner"]).toBe("Appel d'urgence — donnez votre adresse à la téléphoniste");
    expect(fr["notice.accept"]).toMatch(/^J'ai lu et j'accepte/);
  });
});

describe("pickLanguage", () => {
  it("defaults to French", () => {
    expect(pickLanguage([])).toBe("fr");
    expect(pickLanguage(["fr"])).toBe("fr");
    expect(pickLanguage(["es"])).toBe("fr");
    expect(pickLanguage([null])).toBe("fr");
  });
  it("follows the device only when English comes first", () => {
    expect(pickLanguage(["en"])).toBe("en");
    expect(pickLanguage(["en-CA"])).toBe("en");
    expect(pickLanguage(["fr", "en"])).toBe("fr");
  });
  it("respects a saved choice", () => {
    expect(pickLanguage(["en"], "fr")).toBe("fr");
    expect(pickLanguage(["fr"], "en")).toBe("en");
    expect(pickLanguage(["en"], "de")).toBe("en");
  });
});

describe("translate", () => {
  it("interpolates variables", () => {
    expect(translate("fr", "calls.callNumber", { number: "514 555-0123" })).toBe("Appeler le 514 555-0123");
    expect(translate("en", "account.usageOf", { used: 3, cap: 30 })).toBe("3 of 30");
  });
});
