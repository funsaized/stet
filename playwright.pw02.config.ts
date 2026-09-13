import { defineConfig } from "@playwright/test";

// PW-02 investigation only. This config is not wired into package scripts and
// describes no production helper. It proves the packed-package payload boundary.
export default defineConfig({
  testDir: "tests/pw02",
  outputDir: "test-results/pw02/runs",
  globalSetup: "./tests/pw02/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4182", viewport: { width: 1000, height: 800 } },
  webServer: {
    command: "python -m http.server 4182 --bind 127.0.0.1",
    url: "http://127.0.0.1:4182",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT ? [{ name: "webkit", use: { browserName: "webkit" as const } }] : []),
  ],
});
