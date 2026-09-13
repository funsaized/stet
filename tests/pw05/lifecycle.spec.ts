import { expect, test, type Page } from "@playwright/test";
import { createStet } from "../../dist/playwright/entry.js";

const MAIN = "/tests/pw05/fixtures/main.html";
const NEXT = "/tests/pw05/fixtures/next.html";

async function loaded(page: Page) {
  await page.goto(MAIN);
  await page.waitForFunction(() => Boolean((globalThis as Record<string, unknown>).__authored));
}

async function settles<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("remote call hung")), 5000)),
  ]);
}

test("remote handles preserve join, interruption, replay, and destroyed behavior", async ({ page }) => {
  await loaded(page);
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#one"), { animate: true, animationDuration: 60_000 });
  const first = handle.show();
  expect(handle.show()).toBe(first);
  await handle.hide();
  await expect(settles(first)).resolves.toEqual({ status: "cancelled" });

  const replay = handle.replay();
  expect(handle.show()).toBe(replay);
  await handle.destroy();
  await expect(settles(replay)).resolves.toEqual({ status: "cancelled" });
  const afterDestroyA = handle.show();
  const afterDestroyB = handle.show();
  expect(afterDestroyA).not.toBe(afterDestroyB);
  await expect(afterDestroyA).resolves.toEqual({ status: "cancelled" });
  await expect(handle.replay()).resolves.toEqual({ status: "cancelled" });
  await handle.hide();
  await handle.refresh();
  await handle.resketch(3);
  await handle.destroy();
  await session.dispose();
});

test("dispose interrupts reveals, is idempotent, and leaves handles destroyed", async ({ page }) => {
  await loaded(page);
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#one"), { animate: true, animationDuration: 60_000 });
  const pending = handle.show();
  await session.dispose();
  await expect(settles(pending)).resolves.toEqual({ status: "cancelled" });
  await expect(handle.show()).resolves.toEqual({ status: "cancelled" });
  await handle.destroy();
  await session.dispose();
  await expect(session.circle(page.locator("#two"))).rejects.toMatchObject({ code: "SESSION_DISPOSED" });
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
});

test("navigation rejects a pending call, invalidates permanently, and never reinjects", async ({ page }) => {
  await loaded(page);
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#one"), { animate: true, animationDuration: 60_000 });
  const pending = handle.show();
  await page.goto(NEXT);
  await expect(settles(pending)).rejects.toMatchObject({ code: "NAVIGATION" });
  await expect(handle.refresh()).rejects.toMatchObject({ code: "NAVIGATION" });
  await expect(session.circle(page.locator("#next"))).rejects.toMatchObject({ code: "NAVIGATION" });
  await session.dispose();
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelectorAll('script[src*="__stet__"],link[href*="__stet__"]').length)).toBe(0);
});

test("frame detachment rejects its pending call and invalidates the frame session", async ({ page }) => {
  await loaded(page);
  const frame = page.frames().find((candidate) => candidate.url().includes("/frame.html"))!;
  const session = await createStet(frame);
  const handle = await session.circle(frame.locator("#one"), { animate: true, animationDuration: 60_000 });
  const pending = handle.show();
  await page.locator("#frame").evaluate((element) => element.remove());
  await expect(settles(pending)).rejects.toMatchObject({ code: "FRAME_DETACHED" });
  await expect(session.circle(frame.locator("#one"))).rejects.toMatchObject({ code: "FRAME_DETACHED" });
  await session.dispose();
});

test("frame navigation rejects its pending call as NAVIGATION, not detachment", async ({ page }) => {
  await loaded(page);
  const frame = page.frames().find((candidate) => candidate.url().includes("/frame.html"))!;
  const session = await createStet(frame);
  const handle = await session.circle(frame.locator("#one"), { animate: true, animationDuration: 60_000 });
  const pending = handle.show();
  await page.locator("#frame").evaluate((element) => element.setAttribute("src", "/tests/pw05/fixtures/next.html"));
  await expect(settles(pending)).rejects.toMatchObject({ code: "NAVIGATION" });
  await expect(session.circle(frame.locator("#next"))).rejects.toMatchObject({ code: "NAVIGATION" });
  await session.dispose();
});

test("page closure rejects a pending call as PAGE_CLOSED", async ({ page }) => {
  await loaded(page);
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#one"), { animate: true, animationDuration: 60_000 });
  const pending = handle.show();
  await page.close();
  await expect(settles(pending)).rejects.toMatchObject({ code: "PAGE_CLOSED" });
  await session.dispose();
});

test("cleanup is session-owned and unexpected browser failures stay visible", async ({ page }) => {
  await loaded(page);
  const a = await createStet(page);
  const b = await createStet(page);
  const handleA = await a.circle(page.locator("#one"));
  const handleB = await b.circle(page.locator("#two"));
  await expect(page.locator(".stet-overlay")).toHaveCount(3);
  await a.dispose();
  await expect(page.locator(".stet-overlay")).toHaveCount(2);
  await page.evaluate(() => {
    const payload = (globalThis as Record<symbol, { handles: Map<number, { refresh(): void }> }>)[Symbol.for("funsaized.stet.playwright.payload")];
    const remote = payload.handles.values().next().value;
    if (remote) remote.refresh = () => { throw new Error("fixture browser failure"); };
  });
  await expect(handleB.refresh()).rejects.toMatchObject({ code: "BROWSER_OPERATION" });
  await expect(handleA.show()).resolves.toEqual({ status: "cancelled" });
  await b.dispose();
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
});
