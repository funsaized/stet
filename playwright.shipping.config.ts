import { defineConfig } from "@playwright/test";

const vite = "node_modules/vite/bin/vite.js";
const consumer = "test-results/shipping/consumer";

export default defineConfig({
  testDir: "tests/shipping",
  testMatch: "runtime.spec.ts",
  outputDir: "test-results/shipping/runs",
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    ...(process.env.STET_WEBKIT
      ? [{ name: "webkit", use: { browserName: "webkit" as const } }]
      : []),
  ],
  webServer: [
    {
      command: `npm run build --silent && node tests/shipping/prepare.mjs && python -m http.server 4300 --bind 127.0.0.1 --directory ${consumer}/builds`,
      url: "http://127.0.0.1:4300/production/",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `node ${vite} --config ${consumer}/vite.local.config.mjs --host 127.0.0.1 --port 4301 --strictPort`,
      url: "http://127.0.0.1:4301",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `node ${vite} --config ${consumer}/vite.mixed-local.config.mjs --host 127.0.0.1 --port 4302 --strictPort`,
      url: "http://127.0.0.1:4302",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
