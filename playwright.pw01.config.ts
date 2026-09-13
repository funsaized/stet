import { defineConfig } from "@playwright/test";

// PW-01 investigation only. This config is not wired into package scripts and
// does not describe a production helper. Final packaging is PW-02.
export default defineConfig({
  testDir: "tests/pw01",
  outputDir: "test-results/pw01/runs",
  globalSetup: "./tests/pw01/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4180", viewport: { width: 1000, height: 800 } },
  webServer: {
    command: "python -m http.server 4180 --bind 127.0.0.1",
    url: "http://127.0.0.1:4180",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT ? [{ name: "webkit", use: { browserName: "webkit" as const } }] : []),
  ],
});
