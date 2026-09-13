import { expect, test } from "@playwright/test";
import { createStet } from "../../dist/playwright/entry.js";

test("fixed state, fonts, seed, motion, and reveal produce repeatable contextual capture", async ({ page }) => {
  await page.goto("/examples/playwright/");
  await page.waitForFunction(() => document.documentElement.dataset.state === "source-ready");
  await page.evaluate(() => document.fonts.ready);

  const session = await createStet(page);
  const injected = await session.circle(page.getByRole("button", { name: "Place order" }), {
    seed: 29,
    boil: 0.2,
    animate: true,
    animationDuration: 600,
    description: "Action under review",
  });
  await expect(injected.show()).resolves.toEqual({ status: "finished" });
  await injected.refresh();
  await expect(page.locator(".stet-overlay")).toHaveCount(2);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.getByText("Review context: checkout handoff")).toBeVisible();
  await expect(page.getByText("The source annotation marks the total.")).toBeVisible();

  const first = await page.locator("#capture").screenshot({
    path: "test-results/pw07/capture.png",
    animations: "disabled",
  });
  const second = await page.locator("#capture").screenshot({ animations: "disabled" });
  expect(second.equals(first)).toBe(true);
  await session.dispose();
});
