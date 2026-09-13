import { expect, test, type Frame } from "@playwright/test";
import { createStet } from "../../dist/playwright/entry.js";

const STRICT = "/tests/pw06/fixtures/strict.html";

const sameFrame = (frames: Frame[]) =>
  frames.find((frame) => frame.url().includes("127.0.0.1:4186/tests/pw06/fixtures/frame.html"))!;

const hasPolicyProbe = (context: import("@playwright/test").Page | Frame) =>
  context.evaluate(() =>
    Object.getOwnPropertySymbols(globalThis).some((symbol) =>
      symbol.description?.startsWith("funsaized.stet.playwright.policy."),
    ),
  );

test("restrictive self CSP supports Page and same-origin Frame with real CSS", async ({ page }) => {
  await page.goto(STRICT);
  for (const context of [page, sameFrame(page.frames())]) {
    const session = await createStet(context);
    expect(await hasPolicyProbe(context)).toBe(false);
    await session.circle(context.locator("#one"), { seed: 6 });
    const style = await context.locator(".stet-overlay path").evaluate((path) => getComputedStyle(path).stroke);
    expect(style).toBe("rgb(201, 42, 42)");
    await session.dispose();
    await expect(context.locator(".stet-overlay")).toHaveCount(0);
  }
});

test("blocking CSP reports CSP_BLOCKED with rollback and no bypass", async ({ page }) => {
  await page.goto("/tests/pw06/fixtures/blocked.html");
  await expect(createStet(page)).rejects.toMatchObject({
    code: "CSP_BLOCKED",
    message: expect.stringContaining("allow same-origin script-src and style-src"),
  });
  expect(
    await page.evaluate(() => ({
      overlays: document.querySelectorAll(".stet-overlay").length,
      resources: document.querySelectorAll('script[src*="__stet__"],link[href*="__stet__"]').length,
      payload: Boolean((globalThis as Record<symbol, unknown>)[Symbol.for("funsaized.stet.playwright.payload")]),
    })),
  ).toEqual({ overlays: 0, resources: 0, payload: false });
  expect(await hasPolicyProbe(page)).toBe(false);
});

test("non-policy loading failures report LOAD_FAILED and roll back", async ({ page }) => {
  await page.goto(STRICT);
  const frame = page.mainFrame();
  const original = frame.addStyleTag.bind(frame);
  frame.addStyleTag = async () => {
    throw new Error("fixture asset failure");
  };
  await expect(createStet(page)).rejects.toMatchObject({
    code: "LOAD_FAILED",
    message: expect.stringContaining("package-local assets failed to load"),
  });
  frame.addStyleTag = original;
  expect(await hasPolicyProbe(page)).toBe(false);
  expect(await page.locator('.stet-overlay, script[src*="__stet__"], link[href*="__stet__"]').count()).toBe(0);
});

test("unsupported contexts and cross-document arrows reject without mutation", async ({ page }) => {
  await page.goto(STRICT);
  const cross = page.frames().find((frame) => frame.url().includes("localhost:4186"))!;
  await expect(createStet(cross)).rejects.toMatchObject({ code: "UNSUPPORTED_CONTEXT" });
  const opaque = await (await page.locator("#opaque").elementHandle())!.contentFrame();
  await expect(createStet(opaque!)).rejects.toMatchObject({ code: "UNSUPPORTED_CONTEXT" });
  await expect(createStet(page.locator("#one") as never)).rejects.toMatchObject({ code: "UNSUPPORTED_CONTEXT" });
  const session = await createStet(page);
  await expect(session.arrow(page.locator("#one"), sameFrame(page.frames()).locator("#two"))).rejects.toMatchObject({
    code: "WRONG_DOCUMENT",
    primitive: "arrow",
    role: "to",
  });
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
  await session.dispose();
});

test("navigation invalidates without automatic reinjection", async ({ page }) => {
  await page.goto(STRICT);
  const session = await createStet(page);
  await session.circle(page.locator("#one"));
  await page.goto("/tests/pw06/fixtures/next.html");
  await expect(session.circle(page.locator("#next"))).rejects.toMatchObject({ code: "NAVIGATION" });
  expect(await page.locator('.stet-overlay, script[src*="__stet__"], link[href*="__stet__"]').count()).toBe(0);
  await session.dispose();
});
