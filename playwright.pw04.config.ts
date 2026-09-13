import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/pw04",
  outputDir: "test-results/pw04",
  globalSetup: "./tests/pw04/global-setup.ts",
  use: { baseURL: "http://127.0.0.1:4184", viewport: { width: 1000, height: 800 } },
  webServer: {
    command: "python -m http.server 4184 --bind 0.0.0.0",
    url: "http://127.0.0.1:4184",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT ? [{ name: "webkit", use: { browserName: "webkit" as const } }] : []),
  ],
});
