import { defineConfig } from "vitest/config";

// Unit tests cover pure logic only (no React Native imports).
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
