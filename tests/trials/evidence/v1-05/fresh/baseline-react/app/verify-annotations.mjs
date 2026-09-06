import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Exercise the app's built bundle without a server or network access.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setContent((await readFile('dist/index.html', 'utf8')).replace(/<script[^>]*src="[^\"]*"[^>]*><\/script>/g, '').replace(/<link[^>]*>/g, ''));
  await page.addStyleTag({ content: await readFile('dist/app.css', 'utf8') });
  await page.addScriptTag({ content: await readFile('dist/app.js', 'utf8'), type: 'module' });
  const count = async n => { await page.waitForFunction(n => document.querySelectorAll('.stet-overlay').length === n, n); };
  const update = async (enabled, destination, n) => {
    await page.evaluate(([e, d]) => window.trial.update(e, d), [enabled, destination]);
    await count(n);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('[aria-describedby]')].every(el => el.getAttribute('aria-describedby').split(/\s+/).every(id => document.getElementById(id)))), true);
  };
  await count(3);
  await page.evaluate(() => { window.originalDelete = document.querySelector('#delete'); window.oldDestination = document.querySelector('#consequences'); });
  assert.match(await page.locator('#delete').getAttribute('aria-describedby'), /\bnative-warning\b/);
  assert.equal(await page.locator('#delete').getAttribute('type'), 'button');
  assert.equal(await page.locator('#save').getAttribute('type'), 'submit');
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('.stet-overlay')].every(el => getComputedStyle(el).pointerEvents === 'none')), true);
  const enabledBox = await page.locator('#delete').boundingBox();
  await update(false, 1, 0);
  assert.equal(await page.locator('#delete').getAttribute('aria-describedby'), 'native-warning');
  assert.deepEqual(await page.locator('#delete').boundingBox(), enabledBox);
  await update(true, 1, 3);
  await page.evaluate(() => window.trial.update(true, 2));
  await page.waitForFunction(() => !window.oldDestination.isConnected && document.querySelector('#consequences')?.getAttribute('aria-describedby'));
  assert.equal(await page.evaluate(() => window.oldDestination.hasAttribute('aria-describedby')), false);
  await update(true, 0, 2);
  assert.equal(await page.locator('#consequences').count(), 0);
  assert.equal(await page.locator('.stet-overlay--arrow').count(), 0);
  await update(true, 3, 3);
  for (let i = 0; i < 4; i++) {
    await update(false, i + 4, 0);
    await update(true, i + 4, 3);
  }
  assert.equal(await page.evaluate(() => window.originalDelete === document.querySelector('#delete')), true);
  await page.locator('#workspace-name').fill('');
  await page.locator('#save').click();
  assert.equal(await page.evaluate(() => window.submits), 0);
  await page.locator('#workspace-name').fill('My workspace');
  await page.locator('#save').click();
  assert.equal(await page.evaluate(() => window.submits), 1);
  await page.locator('#workspace-name').focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'save');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'delete');
  page.once('dialog', async dialog => { assert.equal(dialog.message(), 'Delete saved settings?'); await dialog.dismiss(); });
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#status').textContent(), 'Settings saved');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#delete').click();
  assert.equal(await page.locator('#status').textContent(), 'Saved settings deleted');
  assert.equal(await page.evaluate(() => window.submits), 1);
  await update(false, 0, 0);
  await update(true, 9, 3);
  assert.equal(await page.locator('#status').textContent(), 'Saved settings deleted');
  assert.equal(await page.locator('#workspace-name').inputValue(), 'My workspace');
  await page.screenshot({ path: '/tmp/baseline-react-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({ path: '/tmp/baseline-react-mobile.png' });
  await page.evaluate(() => window.trial.unmount());
  await count(0);
  assert.equal(await page.locator('.stet-description, .stet-label').count(), 0);
  assert.equal(await page.locator('#host').textContent(), '');
  assert.deepEqual(errors, []);
  console.log('PASS: live toggles, keyed destination replacement/removal/return, ARIA references and cleanup, stable native button/layout, validation/submission, keyboard focus/activation, confirmation cancel/accept, retained app state, unmount, and no browser errors.');
} finally {
  await browser.close();
}
