import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('real controls remain usable with annotations on and off', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('personality');
  await page.getByRole('button', { name: 'Ship something good' }).scrollIntoViewIfNeeded();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(1);
  await page.getByLabel('Project name').fill('A tiny victory');
  await page.getByLabel('Make a little noise').check();
  await page.getByRole('button', { name: 'Ship something good' }).click();
  await expect(page.getByRole('status', { name: 'Launch status' })).toContainText(
    'A tiny victory has launched',
  );
  await page.getByRole('switch', { name: 'Show annotations' }).click();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(0);
  await page.getByRole('switch', { name: 'Show annotations' }).click();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('all primitives, colors, motion, and resketch are live', async ({ page }) => {
  await page.goto('/playground');
  for (const kind of ['underline', 'highlight', 'arrow', 'sticky', 'mark', 'circle']) {
    await page.getByRole('tab', { name: kind, exact: true }).click();
    const specimen = page.getByRole('tabpanel').locator(`.specimen-${kind}`);
    await specimen.scrollIntoViewIfNeeded();
    await expect(specimen).toBeVisible();
    await expect(page.locator(`.stet-overlay--${kind}:not([hidden])`)).toHaveCount(1);
    await expect(page.locator('.mini-code pre')).toContainText(`${kind}(`);
  }
  const circle = page.locator('.stet-overlay--circle:not([hidden])').locator('path').first();
  const initial = await circle.getAttribute('d');
  await page.getByRole('button', { name: 'Resketch', exact: true }).click();
  await expect(circle).not.toHaveAttribute('d', initial!);
  await page.getByRole('button', { name: 'Notebook blue' }).click();
  await expect(page.locator('.mini-code pre')).toContainText('#416ba0');
  const slider = page.getByRole('slider', { name: 'Roughness' });
  await slider.focus();
  await slider.press('End');
  for (let i = 0; i < 5; i++) await slider.press('ArrowLeft');
  await expect(page.locator('.mini-code pre')).toContainText('roughness: 2.5');
  await page.getByRole('switch', { name: 'Animate ink' }).click();
  await expect(page.locator('.mini-code pre')).toContainText('boil: 0.3');
  await expect(page.locator('.stet-boil').first()).toBeAttached();
});

test('framework examples, docs routing, and cleanup work', async ({ page }) => {
  await page.goto('/docs');
  for (const framework of ['JavaScript', 'Vue', 'Svelte', 'Angular', 'React']) {
    await page.getByRole('button', { name: framework, exact: framework !== 'React' }).click();
    await expect(page.locator('.framework-code pre')).toContainText('@funsaized/stet');
  }
  await page.getByRole('link', { name: 'Docs', exact: true }).click();
  await expect(page).toHaveURL(/\/docs$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your first little mark.');
  await expect(page.locator('.stet-overlay')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Back to the pencil case' }).click();
  await expect(page).toHaveURL(/\/playground$/);
  await expect(page.getByRole('tab', { name: 'circle', exact: true })).toBeVisible();
});

test('keyboard tabs and reduced motion are respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/playground');
  await page.getByRole('tab', { name: 'circle', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'underline', exact: true })).toBeFocused();
  await page.getByRole('switch', { name: 'Animate ink' }).click();
  await expect(page.locator('.stet-boil')).toHaveCount(0);
});

test('sticky notes retain readable text with every paper color', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('tab', { name: 'sticky', exact: true }).click();
  for (const color of [
    'Editor red',
    'Forest green',
    'Notebook blue',
    'Highlighter yellow',
    'Graphite',
  ]) {
    await page.getByRole('button', { name: color, exact: true }).click();
    const note = page.locator('.stet-overlay--sticky').last();
    await expect(note).toContainText('A little note, just for you.');
    const contrast = await note.evaluate((element) => {
      const luminance = (color: string) => {
        const [r, g, b] = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((channel) => {
            const linear = channel / 255;
            return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ink = luminance(getComputedStyle(element.querySelector('.stet-sticky-text')!).color);
      const paper = luminance(getComputedStyle(element.querySelector('.stet-sticky-paper')!).fill);
      return (Math.max(ink, paper) + 0.05) / (Math.min(ink, paper) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  }
});

test('pages fit the viewport and meet WCAG AA checks', async ({ page }) => {
  for (const path of ['/', '/docs', '/playground']) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    if (path === '/') await expect(page.locator('.hero-demo')).toHaveCSS('opacity', '1');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
});

test('copy controls copy the pinned install command and current example', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-specific.');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('.install-inline').click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('npm install @funsaized/stet@0.1.0');
  await page.goto('/playground');
  await page.locator('.mini-code').getByRole('button', { name: 'Copy code' }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('circle(element');
});

test('hero annotations stay attached during page scrolling before JavaScript updates', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const button = page.getByRole('button', { name: 'Ship something good' });
  await button.scrollIntoViewIfNeeded();
  const circle = page.locator('.stet-overlay--circle:not([hidden])');
  await expect(circle).toHaveCount(1);
  await expect(circle).toHaveCSS('position', 'absolute');
  const delta = await circle.evaluate((overlay) => {
    const target = document.querySelector('.launch-button')!;
    const before = overlay.getBoundingClientRect();
    const targetBefore = target.getBoundingClientRect();
    const scrollBefore = window.scrollY;
    window.scrollTo({ top: scrollBefore + 50, behavior: 'instant' });
    const after = overlay.getBoundingClientRect();
    const targetAfter = target.getBoundingClientRect();
    return {
      scroll: window.scrollY - scrollBefore,
      x: after.left - targetAfter.left - (before.left - targetBefore.left),
      y: after.top - targetAfter.top - (before.top - targetBefore.top),
    };
  });
  expect(delta.scroll).toBe(50);
  expect(delta.x).toBeCloseTo(0, 1);
  expect(delta.y).toBeCloseTo(0, 1);
});
