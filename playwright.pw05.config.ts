import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/pw05",
  outputDir: "test-results/pw05",
  globalSetup: "./tests/pw05/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4185", viewport: { width: 900, height: 700 } },
  webServer: {
    command: "python -m http.server 4185 --bind 127.0.0.1",
    url: "http://127.0.0.1:4185",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT ? [{ name: "webkit", use: { browserName: "webkit" as const } }] : []),
  ],
});
