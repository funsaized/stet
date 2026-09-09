import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { publicPages, ORIGIN } from '../src/seo';

test('every public route returns static HTML and unknown routes return 404', async ({
  request,
}) => {
  for (const page of publicPages) {
    const response = await request.get(page.path);
    expect(response.status(), page.path).toBe(200);
    const html = await response.text();
    expect(html).toContain(`<title>${page.title.replaceAll('&', '&amp;')}</title>`);
    expect(html).toContain(`href="${ORIGIN}${page.path}"`);
    expect(html).toContain('<h1');
  }
  for (const path of [
    '/this-page-absolutely-does-not-exist',
    '/use-cases/missing',
    '/docs/missing',
    '/assets/missing.js',
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('noindex,follow');
  }
  const homeAlias = await request.get('/index', { maxRedirects: 0 });
  expect(homeAlias.status()).toBe(308);
  expect(homeAlias.headers().location).toBe('/');
  for (const path of ['/docs/', '/docs.html']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe('/docs');
  }
});

for (const path of ['/', '/docs', '/docs/react', '/agent-workflow', '/use-cases/form-review']) {
  test(`readable with JavaScript disabled: ${path}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(path);
    await expect(page).toHaveTitle(publicPages.find((p) => p.path === path)!.title);
    await expect(page.locator('h1')).toBeVisible();
    expect((await page.locator('main').innerText()).length).toBeGreaterThan(300);
    await expect(page.locator('main')).toContainText(/Stet|annotation/i);
    await context.close();
  });
}

test('hydration and client navigation preserve content and metadata', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  for (const route of publicPages) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `${ORIGIN}${route.path}`,
    );
    await page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Docs', exact: true })
      .click();
    await expect(page).toHaveTitle(publicPages.find((p) => p.path === '/docs')!.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
      'content',
      publicPages.find((p) => p.path === '/docs')!.description,
    );
  }
  expect(errors).toEqual([]);
});

test('framework guides fit the viewport and retain accessible code regions', async ({ page }) => {
  for (const route of publicPages.filter((p) => p.kind === 'framework')) {
    await page.goto(route.path);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});
