import { expect, test } from "@playwright/test";

// Use a distinct browser worker for pinned-font screenshots. Firefox can retain
// fallback-glyph choices from earlier demo pages even across browser contexts.
// This matches the normal headless launch but separates the worker fixture pool.
test.use({ launchOptions: { headless: true } });

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/visual/");
  await page.addStyleTag({ url: '/tests/browser/fonts/fixture.css' });
  await page.waitForFunction(() => "handles" in window);
  await page.evaluate(async () => { await document.fonts.ready; (window as any).handles.forEach((handle: any) => handle.refresh()); });
});

test("fixed seeds preserve the visual language", async ({ page }) => {
  await expect(page).toHaveScreenshot("specimens.png", { animations: "disabled" });
});

test("mobile notes follow visible targets and stay in the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const note = page.locator(".stet-overlay--sticky");
  await expect(note).toBeHidden();
  await page.locator("#note").scrollIntoViewIfNeeded();
  await expect(note).toBeVisible();
  const box = (await note.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  await expect(page).toHaveScreenshot("mobile-notes.png", { animations: "disabled" });
});

test("nested scrolling hides clipped targets and restores their marks", async ({ page }) => {
  const target = page.locator("#scrolltarget");
  await target.scrollIntoViewIfNeeded();
  const overlay = page.locator(".stet-overlay--circle").nth(5);
  await expect(overlay).toBeVisible();
  await page.locator(".scroller").evaluate(node => { node.scrollTop = 200; });
  await expect(overlay).toBeHidden();
  await page.locator(".scroller").evaluate(node => { node.scrollTop = 0; });
  await expect(overlay).toBeVisible();
});

test("native input, focus, cleanup, and accessible descriptions survive", async ({ page }) => {
  await page.locator("#input").fill("reader@example.com");
  await expect(page.locator("#input")).toBeFocused();
  await expect(page.locator("#good")).toHaveAccessibleDescription("Approved");
  await page.locator("#clear").click();
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
  await expect(page.locator("[aria-describedby]")).toHaveCount(0);
  await expect(page.locator("#input")).toHaveValue("reader@example.com");
});

test("reduced motion responds while the page is open", async ({ page }) => {
  await page.evaluate(async () => {
    const { circle } = await import("/dist/index.js");
    (window as any).motionHandle = circle(document.querySelector("#button")!, { seed: 5, boil: 0.3, resketchOnHover: true });
  });
  await expect(page.locator(".stet-boil")).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".stet-boil")).toHaveCount(0);
  const d = await page.locator(".stet-overlay").last().locator("path").getAttribute("d");
  await page.locator("#button").hover();
  await expect(page.locator(".stet-overlay").last().locator("path")).toHaveAttribute("d", d!);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".stet-boil")).toHaveCount(3);
});

test("refresh follows movement without reseeding; default drawings stay still", async ({ page }) => {
  const overlay = page.locator(".stet-overlay--circle").first();
  const before = await overlay.locator("path").getAttribute("d");
  const x = (await overlay.boundingBox())!.x;
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#button")!.style.transform = "translateX(20px)";
    (window as any).handles[1].refresh();
  });
  expect((await overlay.boundingBox())!.x).toBeCloseTo(x + 20, 1);
  await expect(overlay.locator("path")).toHaveAttribute("d", before!);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test("forced colors retain distinct marks and readable notes", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const stroke = await page.locator(".stet-mark--right").evaluate(node => getComputedStyle(node).stroke);
  expect(stroke).toBe(await page.locator(".stet-circle").first().evaluate(node => getComputedStyle(node).stroke));
  await expect(page).toHaveScreenshot("forced-colors.png");
});

test("mixed text produces one band per line, and long notes grow with their text", async ({ page }) => {
  const mixed = page.locator(".stet-overlay--highlight").last();
  await page.locator("#mixed").scrollIntoViewIfNeeded();
  await expect(mixed.locator(".stet-highlight:not(.stet-highlight-edge)")).toHaveCount(1);
  await page.locator("#button").scrollIntoViewIfNeeded();
  const dimensions = await page.evaluate(async () => {
    const { sticky } = await import("/dist/index.js");
    const handle = sticky(document.querySelector("#button")!, {
      text: "Leave a useful explanation for the next person. This longer note needs more than the old fixed height, and should remain readable without an inner scrollbar.",
    });
    const root = document.querySelector<HTMLElement>(".stet-overlay:last-child")!;
    const text = root.querySelector<HTMLElement>(".stet-sticky-text")!;
    const dimensions = { height: root.offsetHeight, textHeight: text.offsetHeight, scroll: text.scrollHeight, client: text.clientHeight };
    handle.destroy();
    return dimensions;
  });
  expect(dimensions.height).toBeGreaterThan(88);
  expect(dimensions.height).toBeGreaterThan(dimensions.textHeight);
  expect(dimensions.scroll).toBe(dimensions.client);
});

test("short vertical arrows place labels beside the anchors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.evaluate(async () => {
    (window as any).handles.forEach((handle: any) => handle.destroy());
    document.body.innerHTML = '<h1 id="a" style="position:fixed;left:30px;top:70px;width:240px;height:40px;margin:0">Heading</h1><button id="b" style="position:fixed;left:30px;top:135px;width:240px;height:40px">Continue</button>';
    const { arrow } = await import("/dist/index.js");
    arrow(document.querySelector("#a")!, document.querySelector("#b")!, { label: "poke the cache", seed: 1 });
    return document.querySelector(".stet-label")!.getBoundingClientRect().toJSON();
  });
  expect(box.left).toBeGreaterThan(270);
  expect(box.right).toBeLessThan(390);
});
