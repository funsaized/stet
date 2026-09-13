import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

interface Env {
  entryUrl: string;
  packageRoot: string;
  payloadFile: string;
  styleFile: string;
  tarball: string;
  installMethod: string;
  packedFileCount: number;
  packedPaths: string[];
  payloadGraph: { inputs: string[] };
  coreGraph: { inputs: string[] };
}

const ENV: Env = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../test-results/pw02/env.json", import.meta.url)), "utf8"),
);

const STRICT = "/tests/pw02/fixtures/strict.html";
const STRICT_B = "/tests/pw02/fixtures/strict-b.html";
const COEXIST = "/tests/pw02/fixtures/coexist.html";
const CONTENT_TYPE: Record<string, string> = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
};

async function entry() {
  return import(ENV.entryUrl);
}

/** Serve the installed tarball's files as same-origin URLs for authored code. */
async function routePackedPackage(page: Page) {
  await page.context().route("**/__pkg__/**", (route) => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    const relative = pathname.replace(/^\/__pkg__\//, "");
    const file = join(ENV.packageRoot, relative);
    const extension = file.slice(file.lastIndexOf("."));
    route.fulfill({ contentType: CONTENT_TYPE[extension] ?? "application/octet-stream", body: readFileSync(file) });
  });
}

const state = (page: Page) =>
  page.evaluate(() => ({
    payload: Boolean((globalThis as Record<PropertyKey, unknown>)[Symbol.for("funsaized.stet.playwright.payload")]),
    scripts: document.querySelectorAll('script[src*="__stet__"]').length,
    links: document.querySelectorAll('link[href*="__stet__"]').length,
    overlays: document.querySelectorAll(".stet-overlay").length,
  }));

test("packed IIFE + CSS render a real reveal from package-local assets", async ({ page }) => {
  await page.goto(STRICT);
  const { createStet } = await entry();
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#target"), {
    seed: 5,
    animate: true,
    animationDuration: 300,
  });
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(1);

  const style = await page.locator(".stet-overlay--circle path").evaluate((element) => {
    const path = getComputedStyle(element);
    const overlay = getComputedStyle(element.closest(".stet-overlay") as Element);
    return { stroke: path.stroke, pointerEvents: overlay.pointerEvents };
  });
  // Values below can only come from the packed style.css.
  expect(style.stroke).toBe("rgb(201, 42, 42)");
  expect(style.pointerEvents).toBe("none");

  // No CDN: every package asset request stayed on the page origin.
  const origins = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes("__stet__"))
      .map((entry) => new URL(entry.name).origin),
  );
  expect(origins.length).toBeGreaterThan(0);
  expect(origins.every((origin) => origin === new URL(page.url()).origin)).toBe(true);

  const result = await handle.show();
  expect(["finished", "cancelled"]).toContain(result.status);

  await session.dispose();
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(0);
  expect((await state(page)).payload).toBe(false);
});

test("navigation during a pending reveal settles the call as NAVIGATION, not cancelled or hung", async ({
  page,
}) => {
  await page.goto(STRICT);
  const { createStet, StetPlaywrightError } = await entry();
  const session = await createStet(page);
  const handle = await session.circle(page.locator("#target"), {
    seed: 7,
    animate: true,
    animationDuration: 60_000,
  });

  let resolved: unknown;
  let rejected: { code?: string; name?: string } | undefined;
  const pending = handle.show().then(
    (value: unknown) => {
      resolved = value;
    },
    (error: { code?: string; name?: string }) => {
      rejected = error;
    },
  );

  await page.goto(STRICT_B);

  const outcome = await Promise.race([
    pending.then(() => "settled"),
    new Promise((resolve) => setTimeout(() => resolve("hung"), 5000)),
  ]);
  expect(outcome).toBe("settled");
  expect(resolved).toBeUndefined();
  expect(rejected).toBeInstanceOf(StetPlaywrightError);
  expect(rejected?.code).toBe("NAVIGATION");

  // No automatic reinjection into the new document.
  const after = await state(page);
  expect(after).toEqual({ payload: false, scripts: 0, links: 0, overlays: 0 });

  // The invalidated session rejects later primitives without touching the page.
  await expect(session.circle(page.locator("#target-b"))).rejects.toMatchObject({
    code: "NAVIGATION",
  });
});

test("dispose removes only its own resources; authored and a second session survive", async ({
  page,
}) => {
  await routePackedPackage(page);
  await page.goto(COEXIST);
  await page.waitForFunction(() => Boolean((globalThis as Record<string, unknown>).__authored));

  const { createStet } = await entry();
  const sessionA = await createStet(page);
  const sessionB = await createStet(page);
  await sessionA.circle(page.locator("#helper-a"), { seed: 1 });
  await sessionB.circle(page.locator("#helper-b"), { seed: 2 });
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(3);

  const snapshot = () =>
    page.evaluate(() => {
      const authored = (globalThis as Record<string, unknown>).__authored as {
        overlay: Element;
        path: Element;
      };
      const foreign = getComputedStyle(document.getElementById("foreign") as Element);
      return {
        authoredConnected: authored.overlay.isConnected,
        authoredD: authored.path.getAttribute("d") as string | null,
        foreignOutline: foreign.outlineColor,
        foreignBackground: foreign.backgroundColor,
      };
    });
  const before = await snapshot();
  expect(before.authoredConnected).toBe(true);

  await sessionA.dispose();
  // Only A's overlay and A's injected tag pair are gone.
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(2);
  expect((await state(page)).links).toBe(1);
  expect((await state(page)).scripts).toBe(1);

  const afterA = await snapshot();
  expect(afterA).toEqual(before);

  // B still owns working resources.
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(2);
  const extra = await sessionB.circle(page.locator("#helper-a"), { seed: 9 });
  await extra.destroy();
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(2);

  await sessionB.dispose();
  await expect(page.locator(".stet-overlay--circle")).toHaveCount(1);
  expect(await snapshot()).toEqual(before);
});

for (const abort of ["payload", "style"] as const) {
  test(`load failure (${abort}) rolls back and reports LOAD_FAILED`, async ({ page }) => {
    await page.goto(STRICT);
    const { createStet, StetPlaywrightError } = await entry();
    let failure: { code?: string } | undefined;
    try {
      await createStet(page, { abort });
    } catch (error) {
      failure = error as { code?: string };
    }
    expect(failure).toBeInstanceOf(StetPlaywrightError);
    expect(failure?.code).toBe("LOAD_FAILED");
    expect(await state(page)).toEqual({ payload: false, scripts: 0, links: 0, overlays: 0 });
  });
}
