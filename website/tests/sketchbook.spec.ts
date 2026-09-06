import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage keeps code and playground tools on their own pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tablist')).toHaveCount(0);
  await expect(page.locator('.framework-code')).toHaveCount(0);
  await expect(page.locator('#install')).toContainText('AGENT AND DEVELOPER FIRST.');
  await page.getByRole('link', { name: 'Playground', exact: true }).click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Six ways');
  await page.reload();
  await expect(page.getByRole('tab', { name: 'circle', exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://stetkit.com/playground',
  );
});

test('shuffle changes arrangement, ink geometry, and palette without jumping', async ({ page }) => {
  await page.goto('/#sketchbook');
  await page.locator('.sketchbook-controls').scrollIntoViewIfNeeded();
  await expect(page.locator('.loose-sketch').first()).toBeAttached();
  const book = page.locator('#sketchbook');
  const edition = await book.getAttribute('data-edition');
  const palette = await book.getAttribute('data-palette');
  const seed = await page.locator('.loose-sketch').first().getAttribute('data-sketch-seed');
  const scroll = await page.evaluate(() => scrollY);
  await page.getByRole('button', { name: 'Shuffle everything' }).click();
  await expect(book).not.toHaveAttribute('data-edition', edition!);
  await expect(book).not.toHaveAttribute('data-palette', palette!);
  await expect(page.locator('.loose-sketch').first()).not.toHaveAttribute(
    'data-sketch-seed',
    seed!,
  );
  await expect(page.getByRole('status', { name: 'Sketchbook edition' })).toContainText('Edition 2');
  expect(Math.abs((await page.evaluate(() => scrollY)) - scroll)).toBeLessThan(5);
});

test('scrolling preserves the fixed list, its DOM nodes, state, and page length', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#sketchbook');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.loose-sketch')).toHaveCount(12);
  const before = await page
    .locator('.loose-sketch')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-sketch-seed')));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.getByRole('button', { name: 'A little water, please' }).click();
  const plant = await page.locator('.loose-sketch-plant').elementHandle();
  for (let i = 0; i < 3; i++) {
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await expect(page.locator('.site-footer')).toBeInViewport();
    await page.locator('.sketchbook-controls').scrollIntoViewIfNeeded();
  }
  await expect(page.locator('.loose-sketch')).toHaveCount(12);
  expect(
    await page
      .locator('.loose-sketch')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-sketch-seed'))),
  ).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(height);
  expect(await plant!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(page.getByRole('button', { name: 'Watered 1 time' })).toBeAttached();
  await page.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page.locator('.stet-overlay')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the new whimsical controls respond and retain state', async ({ page }) => {
  await page.goto('/#sketchbook');
  await expect(page.locator('.loose-sketch')).toHaveCount(12);
  expect(
    new Set(
      await page
        .locator('.loose-sketch')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-sketch-kind'))),
    ).size,
  ).toBe(12);
  await page.getByRole('button', { name: 'Open a tiny fortune' }).click();
  await expect(page.locator('.sketch-fortune')).toContainText('Someone is glad you exist.');
  await page.getByRole('button', { name: 'Radiant', exact: true }).click();
  await expect(page.locator('.sketch-mood')).toContainText('absolutely radiant');
  await page.getByRole('button', { name: 'Give 4 stars' }).click();
  await expect(page.locator('.sketch-rating')).toContainText('4 stars. duly noted!');
  await page.getByRole('button', { name: 'Play imaginary record' }).click();
  await expect(page.getByRole('button', { name: 'Pause imaginary record' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'One small step' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '4');
  await page.getByRole('button', { name: 'Begin something new' }).click();
  await expect(page.getByRole('progressbar')).toHaveAttribute('value', '0');
});

test('sketchbook motion can be paused and honors preference changes', async ({ page }) => {
  await page.goto('/#sketchbook');
  await page.locator('.sketchbook-controls').scrollIntoViewIfNeeded();
  await expect(page.locator('.stet-boil').first()).toBeAttached();
  await page.getByRole('button', { name: 'Pause sketchbook motion' }).click();
  await expect(page.locator('.stet-boil')).toHaveCount(0);
  await page.getByRole('button', { name: 'Shuffle everything' }).click();
  await expect(page.locator('.stet-boil')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause sketchbook motion' }).click();
  await expect(page.locator('.stet-boil').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.stet-boil')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Pause sketchbook motion' })).toBeDisabled();
});

test('visible sketchbook controls have no overflow or automated accessibility violations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#sketchbook');
  await page.locator('.sketchbook-controls').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});
