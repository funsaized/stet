import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/pw08",
  outputDir: "test-results/pw08/runs",
  globalSetup: "./tests/pw08/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4188", viewport: { width: 900, height: 700 } },
  webServer: {
    command: "python -m http.server 4188 --bind 127.0.0.1",
    url: "http://127.0.0.1:4188",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
