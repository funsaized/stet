import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const cases = [
  ['workspace-deletion', 1],
  ['security-handoff', 3],
  ['form-review', 1],
  ['feature-showcase', 3],
  ['guided-tutorial', 1],
  ['live-documentation', 3],
] as const;
for (const [id, count] of cases)
  test(`${id}: live annotations, source, pointer transparency and cleanup`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/use-cases/${id}`);
    await page.locator('.application').scrollIntoViewIfNeeded();
    await expect(page.locator('.stet-overlay')).toHaveCount(count);
    expect(
      await page
        .locator('.stet-overlay')
        .evaluateAll((nodes) => nodes.every((n) => getComputedStyle(n).pointerEvents === 'none')),
    ).toBe(true);
    const application = page.locator('.application');
    const before = await application.boundingBox();
    await page.getByRole('button', { name: 'Annotations on', exact: true }).click();
    await expect(page.locator('.stet-overlay')).toHaveCount(0);
    const after = await application.boundingBox();
    expect(after?.width).toBe(before?.width);
    expect(after?.height).toBe(before?.height);
    await page.getByRole('button', { name: 'Annotations off', exact: true }).click();
    await expect(page.locator('.stet-overlay')).toHaveCount(count);
    await page.getByText('Inspect plan, source & verification', { exact: true }).click();
    await expect(page.locator('.artifact-code pre')).toContainText('"version": 1');
    await page.getByRole('button', { name: 'Source', exact: true }).click();
    await expect(page.locator('.artifact-code pre')).toContainText('export function');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Frameworks', exact: true }).click();
    for (const framework of ['vanilla', 'react', 'vue', 'svelte', 'angular']) {
      await page.getByLabel('Framework', { exact: true }).selectOption(framework);
      await expect(page.locator('.artifact-code pre')).toContainText('@funsaized/stet');
    }
    await page.getByRole('link', { name: 'Docs', exact: true }).click();
    await expect(page.locator('.stet-overlay')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

test('workspace exact-name verification, Escape and focus', async ({ page }) => {
  await page.goto('/use-cases/workspace-deletion');
  const digest = page.getByLabel('Send a weekly activity digest');
  await digest.uncheck();
  const remove = page.getByRole('button', { name: 'Delete workspace', exact: true });
  await remove.click();
  const input = page.getByLabel('Type Fieldnotes to confirm');
  const confirm = page.getByRole('button', { name: 'Permanently delete' });
  await expect(input).toBeFocused();
  await expect(confirm).toBeDisabled();
  await input.fill('Field');
  await input.fill('fieldnotes');
  await expect(confirm).toBeDisabled();
  await input.fill('Fieldnotes ');
  await expect(confirm).toBeDisabled();
  await input.fill('Fieldnotes');
  await expect(confirm).toBeEnabled();
  await input.press('Escape');
  await expect(input).toHaveCount(0);
  await expect(remove).toBeFocused();
  await remove.click();
  await input.fill('Fieldnotes');
  await confirm.click();
  await expect(page.getByRole('status')).toContainText('Workspace deleted');
  await expect(remove).toBeDisabled();
  await page.getByRole('button', { name: 'Reset workspace' }).click();
  await expect(remove).toBeEnabled();
});

test('security handoff controls implement the claimed local behavior', async ({ page }) => {
  await page.goto('/use-cases/security-handoff');
  const update = page.getByRole('button', { name: 'Update demo password' });
  await expect(update).toBeDisabled();
  await page.getByLabel('New password').fill('elevenchars');
  await expect(update).toBeDisabled();
  await page.getByLabel('New password').fill('twelve-chars-long');
  await update.click();
  await expect(page.getByText('Password accepted locally; nothing stored.')).toBeVisible();
  await page.getByRole('button', { name: 'Revoke session' }).click();
  await expect(page.getByRole('button', { name: 'Revoke session' })).toBeDisabled();
  await expect(page.getByText('Demo session revoked.')).toBeVisible();
  await page.getByRole('button', { name: 'Set up two-factor' }).click();
  await expect(page.getByText(/Setup step opened/)).toBeVisible();
});

test('review keeps the focus defect reproducible with annotations on and off', async ({ page }) => {
  await page.goto('/use-cases/form-review');
  const publish = page.getByRole('button', { name: 'Publish preview' });
  await publish.click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(publish).toBeFocused();
  await expect(page.locator('.stet-overlay')).toHaveCount(2);
  await page.getByRole('button', { name: 'Annotations on' }).click();
  await publish.click();
  await expect(publish).toBeFocused();
  await page.getByLabel('Release name').fill('Validation report');
  await publish.click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Validation report published');
});

for (const id of ['feature-showcase'])
  test(`${id}: release state remains functional`, async ({ page }) => {
    await page.goto(`/use-cases/${id}`);
    await page.getByLabel('Release name').fill('Security update');
    await page.getByLabel('Private preview — only your team').uncheck();
    await page.getByRole('button', { name: 'Publish preview' }).click();
    await expect(page.getByRole('status')).toContainText(
      'Security update published as a public preview.',
    );
  });

test('agent stages disclose a deterministic workflow and use the same working fixture', async ({
  page,
}) => {
  await page.goto('/agent-workflow');
  await expect(page.getByText(/Deterministic walkthrough; no model/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Before annotations' })).toBeDisabled();
  await expect(page.locator('.stet-overlay')).toHaveCount(0);
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Next stage' }).click();
  await expect(
    page.getByRole('heading', { name: 'Give the human a place to look.' }),
  ).toBeVisible();
  await expect(page.locator('.stet-overlay--circle')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete workspace', exact: true }).click();
  await expect(page.getByLabel('Type Fieldnotes to confirm')).toBeFocused();
});

test('placement controls move label and note, and reset restores reproducible code', async ({
  page,
}) => {
  await page.goto('/playground');
  const initial = await page.locator('.mini-code pre').innerText();
  await page.getByText('Placement & reproducibility', { exact: true }).click();
  for (const kind of ['arrow', 'sticky']) {
    await page.getByRole('tab', { name: kind, exact: true }).click();
    await page.locator('.playground-preview').scrollIntoViewIfNeeded();
    const locator = page.locator(kind === 'arrow' ? '.stet-label' : '.stet-overlay--sticky');
    const before = await locator.getAttribute('style');
    const nudge = page.getByRole('slider', { name: 'Horizontal nudge' });
    await nudge.focus();
    await nudge.press('ArrowRight');
    await expect(locator).not.toHaveAttribute('style', before!);
    await expect(page.locator('.mini-code pre')).toContainText(
      kind === 'arrow' ? 'labelOffsetX:' : 'offsetX:',
    );
  }
  await page.getByRole('button', { name: 'Reset playground' }).click();
  await expect(page.locator('.mini-code pre')).toHaveText(initial);
});

test('new routes fit mobile and pass automated accessibility checks', async ({ page }) => {
  for (const route of [
    '/use-cases/workspace-deletion',
    '/use-cases/security-handoff',
    '/use-cases/form-review',
    '/use-cases/guided-tutorial',
    '/use-cases/live-documentation',
    '/agent-workflow',
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});

test('fixed-seed workspace composition is stable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/use-cases/workspace-deletion');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.application').scrollIntoViewIfNeeded();
  await expect(page.locator('.stet-overlay--circle:not([hidden])')).toHaveCount(1);
  // Body-mounted annotations are included by capturing the viewport, not only the fixture subtree.
  const before = await page.locator('.stet-overlay--circle path').first().getAttribute('d');
  await page.getByRole('button', { name: 'Annotations on' }).click();
  await page.getByRole('button', { name: 'Annotations off' }).click();
  await expect(page.locator('.stet-overlay--circle path').first()).toHaveAttribute('d', before!);
  await page.locator('.application').scrollIntoViewIfNeeded();
  await expect(page).toHaveScreenshot('workspace.png', { animations: 'disabled' });
});

for (const id of ['security-handoff', 'form-review']) {
  test(`${id}: fixed-seed visual composition`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/use-cases/${id}`);
    await page.evaluate(() => document.fonts.ready);
    if (id === 'form-review') await page.getByRole('button', { name: 'Publish preview' }).click();
    else await page.locator('.application').scrollIntoViewIfNeeded();
    await expect(page).toHaveScreenshot(`${id}.png`, { animations: 'disabled' });
  });
}

test('each delivery viewpoint has a distinct working example', async ({ page }) => {
  await page.goto('/use-cases/workspace-deletion');
  await page.getByRole('button', { name: /Product/ }).click();
  await expect(page.locator('[data-fixture="product"]')).toBeVisible();
  await expect(page.getByText('$192 due today', { exact: false })).toBeVisible();
  await page.getByLabel('Annual billing').uncheck();
  await expect(page.getByText('$20 due today', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /UX/ }).click();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByText('All projects:', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: /Engineering/ }).click();
  await expect(page.getByLabel('New password')).toBeVisible();
  await page.getByRole('button', { name: /QE/ }).click();
  await page
    .getByLabel('Import file')
    .setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') });
  await expect(page.getByRole('status')).toContainText('Choose a CSV file');
  await page
    .getByLabel('Import file')
    .setInputFiles({ name: 'data.csv', mimeType: 'text/csv', buffer: Buffer.from('name\nMaya') });
  await expect(page.getByRole('status')).toContainText('accepted');
  await expect(page.locator('.stet-overlay')).toHaveCount(1);
});

test('fixed review returns focus to the invalid field with green ink', async ({ page }) => {
  await page.goto('/use-cases/form-review');
  await page.getByRole('button', { name: 'Fixed', exact: true }).click();
  for (const annotated of [true, false]) {
    if (!annotated) await page.getByRole('button', { name: 'Annotations on' }).click();
    await page.getByRole('button', { name: 'Publish preview' }).click();
    await expect(page.getByLabel('Release name')).toBeFocused();
    await expect(page.getByRole('alert')).toBeVisible();
    if (annotated)
      await expect(page.locator('.stet-overlay path').first()).toHaveCSS(
        'stroke',
        'rgb(39, 128, 68)',
      );
  }
});

test('deployment tutorial preserves choices across steps', async ({ page }) => {
  await page.goto('/use-cases/guided-tutorial');
  await page.getByLabel('Source branch').selectOption('release/security');
  await page.getByRole('button', { name: '2. Choose environment' }).click();
  await page.getByLabel('Production', { exact: true }).check();
  await page.getByRole('button', { name: '3. Deploy' }).click();
  await expect(page.getByLabel('Source branch')).toHaveValue('release/security');
  await page.getByRole('button', { name: 'Queue deployment' }).click();
  await expect(page.getByRole('status')).toContainText('release/security queued for Production');
});

test('activity documentation supports details, filtering and read state', async ({ page }) => {
  await page.goto('/use-cases/live-documentation');
  await page.getByRole('button', { name: /Maya deployed/ }).click();
  await expect(page.getByText(/Deployment completed in staging/)).toBeVisible();
  await page.getByRole('button', { name: 'Unread only' }).click();
  await page.getByRole('button', { name: 'Mark all read' }).click();
  await expect(page.getByRole('button', { name: /Maya deployed/ })).toHaveCount(0);
  await expect(page.locator('.stet-overlay')).toHaveCount(2);
  await page.getByRole('button', { name: 'Unread only' }).click();
  await expect(page.getByRole('button', { name: /Maya deployed/ })).toBeVisible();
});

test('workflow conversation follows stages and keeps commands available on demand', async ({
  page,
}) => {
  await page.goto('/agent-workflow');
  const chat = page.getByRole('region', { name: 'Ask for the outcome. Follow the work.' });
  await expect(chat).toContainText('YOU');
  await expect(chat).toContainText('AGENT · Task · 1 / 8');
  await expect(chat).toContainText('help people understand');
  await page.getByRole('button', { name: 'Next stage' }).click();
  await expect(chat).toContainText('AGENT · Skill · 2 / 8');
  await expect(chat).toContainText('keep the existing warning');
  await expect(page.locator('.workflow-technical pre')).not.toBeVisible();
  await page.getByText('See the technical details', { exact: true }).click();
  await expect(page.locator('.workflow-technical pre')).toContainText('npx stet agent init');
  await page
    .getByRole('navigation', { name: 'Agent workflow stages' })
    .getByRole('button', { name: /Handoff/ })
    .click();
  await expect(chat).toContainText('AGENT · Handoff · 8 / 8');
  await expect(chat).toContainText('doesn’t delete anything on a server');
  await expect(page.locator('.workflow-technical pre')).not.toBeVisible();
});
