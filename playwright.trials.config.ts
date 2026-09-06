import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/trials', testMatch: '*.spec.ts', outputDir: 'test-results/trials',
  use: { baseURL: 'http://127.0.0.1:4178', viewport: {width:1100,height:950}, screenshot:'only-on-failure' },
  webServer: { command: 'python -m http.server 4178 --bind 127.0.0.1', cwd: process.env.STET_TRIAL_ROOT || '/tmp/stet-v1-trials', url:'http://127.0.0.1:4178', reuseExistingServer:!process.env.CI },
  projects: [{ name:'chromium',use:{browserName:'chromium'} }],
});
