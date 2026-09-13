import { expect, test, type Frame, type Page } from "@playwright/test";
import {
  attachCircle,
  destroyAttached,
  hasPayload,
  loadInline,
  loadViaUrl,
  markViaEvaluate,
  ROUTE_STYLE_URL,
} from "./stet-loader";

const STRICT = "/tests/pw01/fixtures/strict.html";
const OPEN = "/tests/pw01/fixtures/open.html";
const BLOCKED = "/tests/pw01/fixtures/blocked.html";
const COEXIST = "/tests/pw01/fixtures/coexist.html";
const FRAME_OUTER = "/tests/pw01/fixtures/frame-outer.html";

async function annotationStyle(target: Page | Frame) {
  return target.evaluate(() => {
    const path = document.querySelector(".stet-overlay--circle path");
    if (!path) throw new Error("no circle path in document");
    const style = getComputedStyle(path);
    const overlay = getComputedStyle(path.closest(".stet-overlay") as Element);
    return {
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      pointerEvents: overlay.pointerEvents,
    };
  });
}

test.describe("transport comparison", () => {
  for (const variant of ["static", "route"] as const) {
    test(`strict CSP: ${variant} same-origin URL transport loads the real renderer and stylesheet`, async ({
      page,
    }) => {
      await page.goto(STRICT);
      const foreignBefore = await page.locator("#foreign").evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, outline: style.outline, position: style.position };
      });
      const loaded = await loadViaUrl(page, page, { variant });
      expect(loaded.violations).toEqual([]);
      expect(await hasPayload(page)).toBe(true);
      expect(await attachCircle(page, "target", 7)).toBe(true);
      await expect(page.locator(".stet-overlay--circle")).toHaveCount(1);

      const style = await annotationStyle(page);
      // Values below can only come from style.css; the renderer sets no inline stroke.
      expect(style.stroke).toBe("rgb(201, 42, 42)");
      expect(style.strokeWidth).toBe("2.2px");
      expect(style.pointerEvents).toBe("none");
      expect(
        await page.locator("#foreign").evaluate((element) => {
          const style = getComputedStyle(element);
          return { background: style.backgroundColor, outline: style.outline, position: style.position };
        }),
      ).toEqual(foreignBefore);
      // The symbol handoff left no bare bundle global on the page.
      expect(await page.evaluate(() => "__stetPw01Bundle" in globalThis)).toBe(false);

      await loaded.cleanup();
      expect(await hasPayload(page)).toBe(false);
    });
  }

  test("strict CSP: inline content transport is blocked by page policy", async ({ page }) => {
    await page.goto(STRICT);
    let failed = false;
    try {
      await loadInline(page, page);
    } catch {
      failed = true;
    }
    expect(failed).toBe(true);
    expect(await hasPayload(page)).toBe(false);
    await expect(page.locator(".stet-overlay--circle")).toHaveCount(0);
  });

  test("open page: the same inline content transport works (baseline), so the failure is CSP", async ({
    page,
  }) => {
    await page.goto(OPEN);
    const loaded = await loadInline(page, page);
    expect(await hasPayload(page)).toBe(true);
    expect(await attachCircle(page, "target", 3)).toBe(true);
    await expect(page.locator(".stet-overlay--circle")).toHaveCount(1);
    await loaded.cleanup();
  });

  test("blocked CSP: URL transport fails detectably and rolls back", async ({ page }) => {
    await page.goto(BLOCKED);
    let failure: unknown;
    try {
      await loadViaUrl(page, page, { variant: "route" });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(Error);
    expect(await hasPayload(page)).toBe(false);
    const leftover = await page.evaluate(() => ({
      scripts: document.querySelectorAll('script[src*="__stet__"]').length,
      links: document.querySelectorAll('link[href*="__stet__"]').length,
      overlays: document.querySelectorAll(".stet-overlay").length,
    }));
    expect(leftover).toEqual({ scripts: 0, links: 0, overlays: 0 });
    // Rejection is portable. Firefox does not expose the CSP violation through
    // the page console, so classification remains a PW-02 packaging question.
  });

  test("blocked CSP: evaluate can run script despite policy (rejected mechanism, recorded)", async ({
    page,
  }) => {
    await page.goto(BLOCKED);
    await markViaEvaluate(page);
    expect(await hasPayload(page)).toBe(true);
  });
});

test.describe("same-origin frame", () => {
  test("strict CSP: route URL transport loads and draws inside a same-origin frame", async ({ page }) => {
    await page.goto(FRAME_OUTER);
    const frame = page.frames().find((candidate) => candidate.url().includes("strict-inner"));
    expect(frame, "same-origin frame must be present").toBeTruthy();
    await frame!.waitForLoadState();

    const loaded = await loadViaUrl(frame!, page, { variant: "route" });
    expect(loaded.violations).toEqual([]);
    expect(await attachCircle(frame!, "frame-target", 11)).toBe(true);

    await expect(page.frameLocator("#frame").locator(".stet-overlay--circle")).toHaveCount(1);
    await expect(page.locator("#outer-target ~ .stet-overlay--circle, body > .stet-overlay--circle")).toHaveCount(0);
    const style = await annotationStyle(frame!);
    expect(style.stroke).toBe("rgb(201, 42, 42)");
    expect(style.pointerEvents).toBe("none");
    // Resource request travelled to the route URL relative to the frame document.
    expect(await frame!.evaluate((marker) => performance.getEntriesByType("resource").some((entry) => entry.name.includes(marker)), ROUTE_STYLE_URL)).toBe(true);
    await loaded.cleanup();
  });
});

test.describe("coexistence and ownership", () => {
  test("strict CSP: injection does not alter source-authored or foreign annotations or remove their resources", async ({
    page,
  }) => {
    await page.goto(COEXIST);
    await page.waitForFunction(() => Boolean((globalThis as Record<string, unknown>).__authored));

    const snapshot = () =>
      page.evaluate(() => {
        const authored = (globalThis as Record<string, unknown>).__authored as {
          overlay: Element;
          path: Element;
          d: string | null;
        };
        const foreign = getComputedStyle(document.getElementById("foreign") as Element);
        const authoredPath = getComputedStyle(authored.path);
        return {
          authoredExists: authored.overlay.isConnected,
          authoredD: authored.path.getAttribute("d"),
          authoredStroke: authoredPath.stroke,
          authoredStrokeWidth: authoredPath.strokeWidth,
          foreignOutline: foreign.outlineColor,
          foreignBackground: foreign.backgroundColor,
          authoredStyleLink: document.querySelectorAll('link[href="/style.css"]').length,
          foreignStyleLink: document.querySelectorAll('link[href="/tests/pw01/fixtures/foreign.css"]').length,
          authoredPayloadScripts: document.querySelectorAll('script[src*="/test-results/pw01/payload.js"]').length,
        };
      });

    const before = await snapshot();
    expect(before.authoredExists).toBe(true);

    const loaded = await loadViaUrl(page, page, { variant: "route" });
    expect(await attachCircle(page, "helper-target", 99)).toBe(true);
    await expect(page.locator(".stet-overlay--circle")).toHaveCount(2);

    const after = await snapshot();
    expect(after.authoredExists).toBe(true);
    expect(after.authoredD).toBe(before.authoredD);
    expect(after.authoredStroke).toBe(before.authoredStroke);
    expect(after.authoredStrokeWidth).toBe(before.authoredStrokeWidth);
    expect(after.foreignOutline).toBe(before.foreignOutline);
    expect(after.foreignBackground).toBe(before.foreignBackground);
    expect(after.authoredStyleLink).toBe(before.authoredStyleLink);
    expect(after.foreignStyleLink).toBe(before.foreignStyleLink);
    expect(after.authoredPayloadScripts).toBe(before.authoredPayloadScripts);

    await destroyAttached(page);
    await loaded.cleanup();
    const afterCleanup = await snapshot();
    // The helper disposed only its own annotation and resources.
    expect(afterCleanup.authoredExists).toBe(true);
    expect(afterCleanup.authoredD).toBe(before.authoredD);
    expect(afterCleanup.authoredStroke).toBe(before.authoredStroke);
    expect(afterCleanup.authoredStyleLink).toBe(before.authoredStyleLink);
    expect(afterCleanup.foreignStyleLink).toBe(before.foreignStyleLink);
    await expect(page.locator(".stet-overlay--circle")).toHaveCount(1);
  });
});

test.describe("rollback after partial load failure", () => {
  for (const fail of ["css", "js"] as const) {
    test(`strict CSP: partial ${fail.toUpperCase()} network failure leaves no injected resources`, async ({
      page,
    }) => {
      await page.goto(STRICT);
      let failed = false;
      try {
        await loadViaUrl(page, page, { variant: "route", fail });
      } catch {
        failed = true;
      }
      expect(failed).toBe(true);
      expect(await hasPayload(page)).toBe(false);
      const leftover = await page.evaluate(() => ({
        scripts: document.querySelectorAll('script[src*="__stet__"]').length,
        links: document.querySelectorAll('link[href*="__stet__"]').length,
        overlays: document.querySelectorAll(".stet-overlay").length,
      }));
      expect(leftover).toEqual({ scripts: 0, links: 0, overlays: 0 });
    });
  }
});
