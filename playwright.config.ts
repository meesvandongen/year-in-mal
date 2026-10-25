import { defineConfig, devices } from "@playwright/test";

// The live suite logs into a real MyAnimeList account and only runs when its
// credentials are configured; see e2e/live.spec.ts.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:8788",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testIgnore: /live\.spec/,
    },
  ],
  // Serves the production build together with the Pages functions, exactly
  // like Cloudflare does. Run `pnpm run build` first.
  webServer: {
    command: "wrangler pages dev dist --port 8788",
    url: "http://localhost:8788",
    reuseExistingServer: !process.env.CI,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
