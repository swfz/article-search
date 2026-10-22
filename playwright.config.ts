import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: "http://localhost:3333",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // pnpm dev は MSW を有効にして起動するため、Algolia への外部通信なしで検索できる
  webServer: {
    command: "pnpm dev -p 3333",
    url: "http://localhost:3333",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
