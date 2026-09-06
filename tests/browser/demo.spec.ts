import { expect, test } from "@playwright/test";

test("demo showcases opt-in motion and hover redraw", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/examples/vanilla/");
  const headline = page.locator(".stet-overlay--underline");
  const circle = page.locator(".stet-overlay--circle path");
  await expect(headline.locator(".stet-boil")).toHaveCount(3);
  await expect(page.locator(".stet-overlay--arrow .stet-boil")).toHaveCount(6);
  await expect(page.locator(".stet-boil")).toHaveCount(9);
  await expect(page.locator(".motion-hint")).toHaveCount(1);
  for (const target of ["#headline", "#email"]) {
    const hintBox = (await page.locator("#motion-hint").boundingBox())!;
    const targetBox = (await page.locator(target).boundingBox())!;
    expect(hintBox.x).toBeGreaterThanOrEqual(0);
    expect(hintBox.x + hintBox.width).toBeLessThan(targetBox.x);
  }
  await expect(circle).toHaveCount(1);
  const initial = await circle.getAttribute("d");
  await page.locator("#email").hover();
  await expect(circle).not.toHaveAttribute("d", initial!);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".stet-boil")).toHaveCount(0);
  const still = await circle.getAttribute("d");
  await page.locator("h1").hover();
  await page.locator("#email").hover();
  await expect(circle).toHaveAttribute("d", still!);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#email").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
