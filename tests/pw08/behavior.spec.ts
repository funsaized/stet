import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const env: { entryUrl: string } = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../test-results/pw08/env.json", import.meta.url)), "utf8"),
);

async function annotate(page: Page) {
  const { createStet } = await import(env.entryUrl);
  const before = await page.locator("#email").boundingBox();
  const session = await createStet(page);
  await session.circle(page.locator("#email"), { seed: 4, description: "Field under review" });
  await session.underline(page.locator("#submit"), { seed: 8 });
  return { session, before };
}

async function verifyNativeBehavior(
  page: Page,
  before: { x: number; y: number; width: number; height: number } | null,
) {
  expect(await page.evaluate(() => {
    const nodes = (globalThis as Record<string, unknown>).__behaviorNodes as { email: Element; submit: Element };
    return nodes.email === document.querySelector("#email") && nodes.submit === document.querySelector("#submit");
  })).toBe(true);
  expect(await page.locator("#email").boundingBox()).toEqual(before);
  await page.locator("#email").fill("reader@example.com");
  await expect(page.locator("#email")).toBeFocused();
  await expect(page.locator("#email")).toHaveValue("reader@example.com");
  await expect(page.locator("#email")).toHaveAccessibleDescription(/Email used for the receipt.*Field under review/);
  expect(await page.locator(".stet-overlay").first().evaluate((element) => getComputedStyle(element).pointerEvents)).toBe("none");
  await page.locator("#submit").click();
  await expect(page.locator("#status")).toHaveText("Submitted reader@example.com");
}

test("packed helper annotations preserve independently asserted native behavior", async ({ page }) => {
  await page.goto("/examples/playwright/behavior.html");
  await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
  const { session, before } = await annotate(page);
  try {
    await verifyNativeBehavior(page, before);
  } finally {
    await session.dispose();
  }
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
  await expect(page.locator("#email")).toHaveAttribute("aria-describedby", "native-help");
});

test("the same annotations do not hide a broken submit, and cleanup still runs", async ({ page }) => {
  await page.goto("/examples/playwright/behavior.html?broken=1");
  await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
  const { session, before } = await annotate(page);
  await expect(page.locator(".stet-overlay")).toHaveCount(2);
  let detected: unknown;
  try {
    await verifyNativeBehavior(page, before);
  } catch (error) {
    detected = error;
  } finally {
    await session.dispose();
  }
  expect(detected).toBeInstanceOf(Error);
  await expect(page.locator("#status")).toHaveText("Broken fixture did not submit");
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
  await expect(page.locator("#email")).toHaveAttribute("aria-describedby", "native-help");
});
