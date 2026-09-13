import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/handoff",
  outputDir: "test-results/handoff/runs",
  globalSetup: "./tests/handoff/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:4189",
    viewport: { width: 900, height: 700 },
    colorScheme: "light",
    reducedMotion: "reduce",
  },
  webServer: {
    command: "python -m http.server 4189 --bind 127.0.0.1",
    url: "http://127.0.0.1:4189",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
