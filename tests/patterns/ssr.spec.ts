import { expect, test } from '@playwright/test';
for (const framework of ['react', 'vue', 'svelte', 'angular']) test(`${framework}: server render, client attach, update and unmount`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' || /hydration.*(?:mismatch|failed)/i.test(message.text())) errors.push(message.text()); });
  await page.goto(`/test-results/patterns/${framework}-ssr.html`);
  await expect(page.getByRole('button', { name: 'Review action' })).toHaveCount(1);
  await expect(page.locator('.stet-overlay, .stet-description')).toHaveCount(0);
  await page.locator('button').evaluate(node => { (window as any).serverControl = node; });
  await page.addScriptTag({ type: 'module', url: `/test-results/patterns/${framework}.hydrate.js` });
  await expect(page.locator('.stet-overlay')).toHaveCount(2);
  // Angular's bounded smoke is server/client attachment, not configured hydration.
  if (framework !== 'angular') expect(await page.locator('button').evaluate(node => node === (window as any).serverControl)).toBe(true);
  await page.evaluate(() => (window as any).trial.update(true, 1));
  await expect(page.locator('.stet-overlay')).toHaveCount(3);
  await page.evaluate(() => (window as any).trial.update(false, 0));
  await expect(page.locator('.stet-overlay, .stet-description')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Review action' })).toHaveCount(1);
  await page.evaluate(() => (window as any).trial.unmount());
  await expect(page.locator('button, .stet-overlay, .stet-description')).toHaveCount(0);
  expect(errors).toEqual([]);
});
