import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "@ochairo/pulse",
        "@ochairo/beat",
        "@ochairo/beat/jsx-runtime",
        "@ochairo/beat/jsx-dev-runtime",
        "@ochairo/numbers",
        "@ochairo/scales",
      ],
    },
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});
