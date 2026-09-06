import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/patterns',
  outputDir: 'test-results/pattern-runs',
  use: { baseURL: 'http://127.0.0.1:4177', viewport: { width: 1000, height: 800 }, screenshot: 'only-on-failure' },
  webServer: { command: 'python -m http.server 4177 --bind 127.0.0.1', url: 'http://127.0.0.1:4177', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    ...(process.env.STET_WEBKIT ? [{ name: 'webkit', use: { browserName: 'webkit' as const } }] : []),
  ],
});
