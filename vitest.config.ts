import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ochairo/pulse": resolve(__dirname, "../pulse/src/index.ts"),
      "@ochairo/beat/jsx-runtime": resolve(
        __dirname,
        "../beat/src/jsx-runtime.ts",
      ),
      "@ochairo/beat/jsx-dev-runtime": resolve(
        __dirname,
        "../beat/src/jsx-dev-runtime.ts",
      ),
      "@ochairo/beat": resolve(__dirname, "../beat/src/index.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: ["dist/**"],
  },
});
