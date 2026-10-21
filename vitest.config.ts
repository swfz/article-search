import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: ["pages/**", "mocks/**"],
      exclude: ["mocks/json/**", "__tests__/**"],
      thresholds: { lines: 70 },
    },
  },
});
