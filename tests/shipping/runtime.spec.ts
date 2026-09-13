import { expect, test, type Page } from "@playwright/test";

async function verify(page: Page, url: string, production: number, review: number) {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "true");
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(production);
  await expect(page.locator(".stet-overlay--underline")).toHaveCount(review);
  await page.getByRole("button", { name: "Run action" }).click();
  await expect(page.locator("#status")).toHaveText("Clicked");
}

for (const [name, production, review] of [
  ["production", 1, 0],
  ["preview-customer", 0, 0],
  ["preview-preview", 0, 1],
  ["local-build", 0, 0],
  ["disabled", 0, 0],
  ["mixed-customer", 1, 0],
  ["mixed-preview", 1, 1],
] as const) {
  test(`${name} build renders the contracted annotations and native behavior`, ({ page }) =>
    verify(page, `http://127.0.0.1:4300/${name}/`, production, review));
}

test("local-only development renders review annotations", ({ page }) =>
  verify(page, "http://127.0.0.1:4301/", 0, 1));

test("mixed local development retains production and review annotations", ({ page }) =>
  verify(page, "http://127.0.0.1:4302/", 1, 1));
