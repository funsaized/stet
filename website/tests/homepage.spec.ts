import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('real controls remain usable with annotations on and off', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('interactive');
  const save = page.getByRole('button', { name: 'Save', exact: true });
  await save.scrollIntoViewIfNeeded();
  await expect(save).toBeDisabled();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(1);
  await expect(page.locator('#save-hint')).toContainText(
    'Save stays off until the title has a name',
  );
  await page.getByLabel('Title', { exact: true }).fill('A tiny victory');
  await expect(save).toBeEnabled();
  await expect(page.locator('#save-hint')).toContainText('Title is set. Save is available.');
  await save.click();
  await expect(page.getByRole('status', { name: 'Save status' })).toContainText('A tiny victory');
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
  await expect(page.locator('.mini-code pre')).toContainText('boil: 0.8');
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
    if (path === '/playground') {
      expect(
        await page.locator('.playground-preview').evaluate((el) => {
          const parent = el.closest('.playground')!.getBoundingClientRect();
          return Math.round(el.getBoundingClientRect().width) <= Math.round(parent.width) + 1;
        }),
      ).toBe(true);
    }
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
  await expect(page.locator('.install-inline code')).toHaveText(
    'npm install @funsaized/stet@0.1.0',
  );
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

test('playground annotations stay attached during page scrolling before JavaScript updates', async ({
  page,
}) => {
  await page.goto('/playground');
  await page.evaluate(() => document.fonts.ready);
  const circle = page.locator('.stet-overlay--circle:not([hidden])');
  await page.locator('.specimen-text').scrollIntoViewIfNeeded();
  await expect(circle).toHaveCount(1);
  await expect(circle).toHaveCSS('position', 'absolute');
  const delta = await circle.evaluate((overlay) => {
    const target = document.querySelector('.specimen-text')!;
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

test('hero annotations stay attached during page scrolling before JavaScript updates', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const button = page.getByRole('button', { name: 'Save', exact: true });
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

test('homepage states category, user, value, next action, and equal paths', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');
  await expect(main).toContainText('Code-native annotation library');
  await expect(main).toContainText('frontend developers and coding agents');
  await expect(main).toContainText('without turning the example into a screenshot');
  await expect(main).toContainText('Next action: try Save, then install');
  await expect(page.getByRole('heading', { level: 2, name: /Write it yourself/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Ask your agent.' })).toBeVisible();
  await expect(main).toContainText(
    'Stet does not run a model, edit your app, apply a plan, or decide whether the UI passed',
  );
  await expect(page.locator('.home-snippet pre')).toContainText('circle(save');
  await expect(page.locator('.home-snippet pre')).toContainText('underline(hint');
  await expect(page.locator('.home-snippet pre')).toContainText('boil');
  await expect(page.locator('.home-snippet pre')).not.toContainText('animate');
  await expect(page.locator('.home-snippet pre')).not.toContainText('visible');
  await expect(page.locator('.home-snippet pre')).not.toContainText('show(');
  await expect(page.locator('.home-snippet pre')).not.toContainText('replay(');
  await expect(page.locator('.home-snippet pre')).not.toContainText('animationDuration');
});

test('keyboard can enable Save and optional boil stays still with reduced motion', async ({
  page,
}) => {
  await page.goto('/');
  const title = page.getByLabel('Title', { exact: true });
  await title.scrollIntoViewIfNeeded();
  await title.focus();
  await page.keyboard.type('Keyboard note');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Save status' })).toContainText('Keyboard note');
  const liveCircle = page.locator('.stet-overlay--circle:not([hidden])');
  await expect(liveCircle.locator('.stet-boil')).toHaveCount(0);
  await page.getByRole('switch', { name: 'Optional motion' }).click();
  await expect(liveCircle.locator('.stet-boil').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.stet-boil')).toHaveCount(0);
});

test('equal first-success paths share Save, stay release-correct, and keep the mobile CTA', async ({
  page,
}) => {
  await page.goto('/');
  const cta = page.locator('.hero-actions').getByRole('link', { name: /Get started/ });
  await expect(cta).toBeVisible();
  await cta.focus();
  await expect(cta).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#install/);
  const install = page.locator('#install');
  await expect(
    install.getByRole('heading', { level: 3, name: 'Write it yourself.' }),
  ).toBeVisible();
  await expect(install.getByRole('heading', { level: 3, name: 'Ask your agent.' })).toBeVisible();
  const write = page.locator('#write');
  const ask = page.locator('#ask');
  for (const path of [write, ask, install]) {
    await expect(path).toContainText('@funsaized/stet');
    await expect(path).toContainText('style.css');
    await expect(path).toContainText('destroy');
    await expect(path).toContainText('boil');
    await expect(path).toContainText(
      'Should this explanation remain in the application, or exist only in this captured handoff?',
    );
    await expect(path).not.toContainText('@funsaized/stet/playwright');
    await expect(path).not.toContainText('createStet');
  }
  const snippet = await page.locator('.home-snippet pre').innerText();
  expect(snippet).toContain('circle(save');
  expect(snippet).toContain('underline(hint');
  expect(snippet).toContain('@funsaized/stet/style.css');
  expect(snippet).toContain('handle.destroy()');
  expect(snippet).not.toMatch(/animate|visible|show\(|replay\(|animationDuration|playwright/);
  await page.goto('/docs');
  await page.getByRole('link', { name: 'Write it yourself', exact: true }).click();
  await expect(page.locator('#write pre')).toHaveText(snippet);
  await expect(page.locator('#write')).toContainText(
    'Should this explanation remain in the application, or exist only in this captured handoff?',
  );
  await page.getByRole('link', { name: 'Ask your agent', exact: true }).click();
  await expect(page.locator('#agents')).toContainText('@funsaized/stet/style.css');
  await expect(page.locator('#agents')).toContainText('Destroy the handles on cleanup');
  await expect(page.locator('#agents')).toContainText('boil: 0');
  await expect(page.locator('#agents')).toContainText(
    'Should this explanation remain in the application, or exist only in this captured handoff?',
  );
  await expect(page.locator('#agents')).toContainText(
    'Stet does not run an agent, edit automatically, apply plans, or perform QA',
  );
  await expect(page.locator('#agents')).not.toContainText('@funsaized/stet/playwright');
  await expect(page.locator('#agents')).not.toContainText('createStet');
  await expect(page.locator('#agents')).toContainText(
    'advertised 0.1.0 package does not export Playwright injection',
  );
  await page
    .locator('#agents')
    .getByRole('link', { name: /homepage Save circle and underline/ })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.stet-overlay--underline:not([hidden])')).toHaveCount(2);
});
