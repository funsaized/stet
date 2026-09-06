import { defineConfig } from "@playwright/test";

export default defineConfig({
  outputDir: "test-results/demos-runs",
  testDir: "tests/demos",
  use: { viewport: { width: 1200, height: 1100 } },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
  ],
  webServer: [
    { command: "python -m http.server 4175 --bind 127.0.0.1", url: "http://127.0.0.1:4175" },
    { command: "npm --prefix examples/react run dev -- --host 127.0.0.1 --port 5175 --strictPort", url: "http://127.0.0.1:5175" },
    { command: "npm --prefix examples/svelte run dev -- --host 127.0.0.1 --port 5176 --strictPort", url: "http://127.0.0.1:5176" },
    { command: "npm --prefix examples/angular start -- --host 127.0.0.1 --port 4201", url: "http://127.0.0.1:4201" },
  ],
});
