import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const pulseSource = resolve(__dirname, "../pulse/src/index.ts");
const beatSource = resolve(__dirname, "../beat/src/index.ts");
const beatJsxRuntime = resolve(__dirname, "../beat/src/jsx-runtime.ts");
const beatJsxDevRuntime = resolve(__dirname, "../beat/src/jsx-dev-runtime.ts");

const isMonorepo = existsSync(pulseSource) && existsSync(beatSource);

export default defineConfig({
  resolve: {
    alias: isMonorepo
      ? {
          "@ochairo/pulse": pulseSource,
          "@ochairo/beat/jsx-runtime": beatJsxRuntime,
          "@ochairo/beat/jsx-dev-runtime": beatJsxDevRuntime,
          "@ochairo/beat": beatSource,
        }
      : {},
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["dist/**"],
  },
});
