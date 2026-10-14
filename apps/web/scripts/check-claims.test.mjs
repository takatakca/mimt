import test from "node:test";
import assert from "node:assert/strict";
import { assertNoUnapprovedAiClaims } from "./check-claims.mjs";

for (const claim of [
  "The AI is provided by Claude, a model from Anthropic.",
  "Each account has an AI monthly cap.",
  "A conversation with the AI is limited to 5 minutes.",
  "Le réceptionniste est limité à cinq minutes.",
]) {
  test("rejects an unverified AI launch promise: " + claim, () => {
    assert.throws(() => assertNoUnapprovedAiClaims("<main>" + claim + "</main>", "en/ai"), /Unapproved AI claim/);
  });
}

test("allows conditional pre-launch AI copy in both languages", () => {
  for (const copy of [
    "AI features remain in development. No usage limit or AI provider is contractually confirmed.",
    "Les fonctionnalités IA demeurent en préparation. Aucun plafond de consommation ni fournisseur d’IA n’est confirmé.",
  ]) {
    assert.doesNotThrow(() => assertNoUnapprovedAiClaims("<main>" + copy + "</main>", "ia"));
  }
});
