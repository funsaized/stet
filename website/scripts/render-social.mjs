import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(new URL('../public/social.svg', import.meta.url).href);
  await page.screenshot({ path: fileURLToPath(new URL('../public/social.png', import.meta.url)) });
} finally {
  await browser.close();
}
