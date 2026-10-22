import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      include: ["pages/**", "mocks/**"],
      exclude: ["mocks/json/**", "__tests__/**"],
      thresholds: { lines: 70 },
    },
  },
});
