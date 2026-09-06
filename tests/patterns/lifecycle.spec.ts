import { expect, test } from '@playwright/test';
for (const framework of ['vanilla', 'react', 'vue', 'svelte', 'angular']) test(`${framework}: persistent controls and changing destinations`, async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const active = new Set<object>();
    (window as any).activeObservers = active;
    for (const name of ['ResizeObserver', 'IntersectionObserver']) {
      const Original = (window as any)[name];
      (window as any)[name] = class extends Original {
        observe(...args: any[]) { active.add(this); return super.observe(...args); }
        disconnect() { active.delete(this); return super.disconnect(); }
      };
    }
  });
  await page.goto(`/test-results/patterns/${framework}.html`);
  await expect(page.locator('.stet-overlay')).toHaveCount(2);
  const button = page.getByRole('button', { name: 'Review action' });
  await button.evaluate(node => { (window as any).originalControl = node; node.setAttribute('aria-describedby', node.getAttribute('aria-describedby') + ' native-warning'); const warning = document.createElement('p'); warning.id = 'native-warning'; warning.textContent = 'Application-owned warning'; document.body.append(warning); });
  const update = async (enabled: boolean, destination: number, count: number) => {
    await page.evaluate(([e,d]) => (window as any).trial.update(e,d), [enabled, destination]);
    await expect(page.locator('.stet-overlay')).toHaveCount(count);
    expect(await button.evaluate(node => node === (window as any).originalControl)).toBe(true);
    await expect(button).toHaveAttribute('type', 'submit');
    await expect(button).toHaveAccessibleDescription(/Application-owned warning/);
    await button.focus(); await expect(button).toBeFocused();
  };
  await update(false, 0, 0);
  await button.press('Enter');
  expect(await page.evaluate(() => (window as any).submits)).toBe(1);
  await update(true, 0, 2);
  await update(true, 1, 3);
  await page.locator('#host p').evaluate(node => { (window as any).previousDestination = node; });
  await update(true, 2, 3);
  expect(await page.locator('#host p').evaluate(node => node !== (window as any).previousDestination)).toBe(true);
  await expect(button).toHaveAccessibleDescription(/Review this action.*Read the consequences/s);
  await expect(page.locator("#host p")).toHaveAccessibleDescription("Consequences are explained here.");
  await button.click();
  expect(await page.evaluate(() => (window as any).submits)).toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.scrollTo(0, 80));
  await expect(button).toBeInViewport();
  if (info.project.name === 'webkit') await expect(page).toHaveScreenshot(`${framework}-lifecycle.png`);
  await page.screenshot({ path: info.outputPath(`${framework}-lifecycle.png`), fullPage: false });
  await update(true, 0, 2);
  await update(false, 0, 0);
  await expect(button).toHaveAttribute('aria-describedby', 'native-warning');
  await expect(page.locator('.stet-description')).toHaveCount(0);
  await page.evaluate(() => (window as any).trial.unmount());
  await expect(page.locator('.stet-overlay, .stet-description')).toHaveCount(0);
  await expect(page.locator('#host button')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).activeObservers.size)).toBe(0);
  expect(errors).toEqual([]);
});
