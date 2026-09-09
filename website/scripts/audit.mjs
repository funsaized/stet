// Read-only crawl of a local build or deployed origin. Run after npm run build.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { publicPages } from '../.ssr/entry-server.js';
const base = process.argv[2] ?? 'http://127.0.0.1:4175';
const output = process.argv[3] ?? 'reports/seo/after-local.json';
const browser = await chromium.launch();
const results = [];
try {
  for (const path of [...publicPages.map((p) => p.path), '/this-page-absolutely-does-not-exist']) {
    const row = { path };
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({ javaScriptEnabled });
      const page = await context.newPage();
      const response = await page.goto(base + path, { waitUntil: 'networkidle' });
      row[javaScriptEnabled ? 'rendered' : 'initial'] = {
        status: response.status(),
        url: page.url(),
        headers: await response.allHeaders(),
        ...(await page.evaluate(() => ({
          title: document.title,
          meta: Array.from(document.querySelectorAll('meta')).map((x) => ({
            name: x.name || x.getAttribute('property'),
            content: x.content,
          })),
          canonical: document.querySelector('link[rel=canonical]')?.href,
          h1: Array.from(document.querySelectorAll('h1')).map((x) => x.textContent),
          text: document.body.innerText,
          links: Array.from(document.querySelectorAll('a[href]')).map((x) =>
            x.getAttribute('href'),
          ),
          jsonld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(
            (x) => x.textContent,
          ),
          js: performance
            .getEntriesByType('resource')
            .filter((x) => x.name.includes('.js'))
            .map((x) => ({ url: x.name, bytes: x.transferSize, decoded: x.decodedBodySize })),
        }))),
      };
      await context.close();
    }
    results.push(row);
  }
  await writeFile(output, JSON.stringify(results, null, 2) + '\n');
  console.log(`Audited ${results.length} URLs with and without JavaScript: ${output}`);
} finally {
  await browser.close();
}
