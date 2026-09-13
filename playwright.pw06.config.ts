import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/pw06",
  outputDir: "test-results/pw06",
  globalSetup: "./tests/pw06/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4186", viewport: { width: 900, height: 700 } },
  webServer: {
    command: "python -m http.server 4186 --bind 0.0.0.0",
    url: "http://127.0.0.1:4186",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT ? [{ name: "webkit", use: { browserName: "webkit" as const } }] : []),
  ],
});
