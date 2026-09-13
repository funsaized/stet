// PW-01 investigation helpers. Test-only; no production export is added.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ConsoleMessage, ElementHandle, Frame, Page } from "@playwright/test";

export type Target = Page | Frame;
export type Transport = "inline" | "url-static" | "url-route";

export const PAYLOAD_SYMBOL = "funsaized.stet.pw01.payload";
export const PAYLOAD_FILE = fileURLToPath(new URL("../../test-results/pw01/payload.js", import.meta.url));
export const STYLE_FILE = fileURLToPath(new URL("../../style.css", import.meta.url));
export const STATIC_PAYLOAD_URL = "/test-results/pw01/payload.js";
export const STATIC_STYLE_URL = "/style.css";
const ROUTE_MARKER = "/__stet__/";
export const ROUTE_PAYLOAD_URL = `${ROUTE_MARKER}payload.js`;
export const ROUTE_STYLE_URL = `${ROUTE_MARKER}style.css`;

const READY_TIMEOUT_MS = 3000;

export interface Loaded {
  transport: Transport;
  violations: string[];
  cleanup(): Promise<void>;
}

function cspListener(violations: string[]) {
  return (message: ConsoleMessage) => {
    if (/content security policy|refused to (?:load|apply|execute)/i.test(message.text()))
      violations.push(message.text());
  };
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  // Keep an unhandled rejection from surfacing after the timeout wins the race.
  promise.catch(() => {});
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${READY_TIMEOUT_MS}ms`)), READY_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function waitForPayload(target: Target): Promise<boolean> {
  await target.waitForFunction(
    (key) => typeof (globalThis as Record<string, unknown>)[Symbol.for(key)] === "object",
    PAYLOAD_SYMBOL,
    { timeout: READY_TIMEOUT_MS },
  );
  return true;
}

export async function hasPayload(target: Target): Promise<boolean> {
  return target.evaluate((key) => typeof (globalThis as Record<string, unknown>)[Symbol.for(key)] === "object", PAYLOAD_SYMBOL);
}

async function installRoutes(page: Page): Promise<void> {
  const context = page.context();
  await context.route("**/__stet__/payload.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: readFileSync(PAYLOAD_FILE, "utf8") }),
  );
  await context.route("**/__stet__/style.css", (route) =>
    route.fulfill({ contentType: "text/css", body: readFileSync(STYLE_FILE, "utf8") }),
  );
}

async function removeRoutes(page: Page): Promise<void> {
  const context = page.context();
  await context.unroute("**/__stet__/payload.js");
  await context.unroute("**/__stet__/style.css");
}

async function deletePayload(target: Target): Promise<void> {
  await target
    .evaluate((key) => {
      delete (globalThis as Record<string, unknown>)[Symbol.for(key)];
    }, PAYLOAD_SYMBOL)
    .catch(() => {});
}

/** Remove only the resources this investigation injected (never authored ones). */
async function sweepInjected(target: Target, marker: string): Promise<void> {
  await target
    .evaluate((needle) => {
      for (const node of Array.from(document.querySelectorAll("link[href],script[src]"))) {
        const ref = node.getAttribute("href") ?? node.getAttribute("src") ?? "";
        if (ref.includes(needle)) node.remove();
      }
    }, marker)
    .catch(() => {});
}

export interface UrlOptions {
  variant: "static" | "route";
  /** Simulated partial failure for rollback evidence. */
  fail?: "js" | "css";
}

export async function loadViaUrl(target: Target, page: Page, options: UrlOptions): Promise<Loaded> {
  const violations: string[] = [];
  const listener = cspListener(violations);
  page.on("console", listener);
  const routeMode = options.variant === "route";
  const marker = routeMode ? ROUTE_MARKER : "/test-results/pw01/";
  if (routeMode) {
    await installRoutes(page);
    if (options.fail === "js")
      await page.context().route("**/__stet__/payload.js", (route) => route.abort("failed"));
    if (options.fail === "css")
      await page.context().route("**/__stet__/style.css", (route) => route.abort("failed"));
  }
  let css: ElementHandle | null = null;
  let js: ElementHandle | null = null;
  try {
    css = await withTimeout(
      target.addStyleTag({ url: routeMode ? ROUTE_STYLE_URL : STATIC_STYLE_URL }),
      "addStyleTag",
    );
    js = await withTimeout(
      target.addScriptTag({ url: routeMode ? ROUTE_PAYLOAD_URL : STATIC_PAYLOAD_URL }),
      "addScriptTag",
    );
    await waitForPayload(target);
    return {
      transport: routeMode ? "url-route" : "url-static",
      violations,
      async cleanup() {
        await sweepInjected(target, marker);
        await css?.evaluate((node) => node.remove()).catch(() => {});
        await js?.evaluate((node) => node.remove()).catch(() => {});
        await deletePayload(target);
        if (routeMode) await removeRoutes(page);
        page.off("console", listener);
      },
    };
  } catch (error) {
    await sweepInjected(target, marker);
    await css?.evaluate((node) => node.remove()).catch(() => {});
    if (routeMode) await removeRoutes(page);
    page.off("console", listener);
    throw error;
  }
}

export async function loadInline(target: Target, page: Page): Promise<Loaded> {
  const violations: string[] = [];
  const listener = cspListener(violations);
  page.on("console", listener);
  let css: ElementHandle | null = null;
  let js: ElementHandle | null = null;
  try {
    css = await withTimeout(
      target.addStyleTag({ content: readFileSync(STYLE_FILE, "utf8") }),
      "inline addStyleTag",
    );
    js = await withTimeout(
      target.addScriptTag({ content: readFileSync(PAYLOAD_FILE, "utf8") }),
      "inline addScriptTag",
    );
    await waitForPayload(target);
    return {
      transport: "inline",
      violations,
      async cleanup() {
        await css?.evaluate((node) => node.remove()).catch(() => {});
        await js?.evaluate((node) => node.remove()).catch(() => {});
        await deletePayload(target);
        page.off("console", listener);
      },
    };
  } catch (error) {
    await css?.evaluate((node) => node.remove()).catch(() => {});
    page.off("console", listener);
    throw error;
  }
}

/** Deliberate CSP bypass probe. Kept only to document why evaluate is rejected. */
export async function markViaEvaluate(target: Target): Promise<void> {
  await target.evaluate((key) => {
    (globalThis as Record<string, unknown>)[Symbol.for(key)] = { injectedBy: "evaluate" };
  }, PAYLOAD_SYMBOL);
}

const HANDLE_SYMBOL = "funsaized.stet.pw01.handle";

/** Read the payload through a remote call, as a Playwright helper would. */
export async function attachCircle(target: Target, elementId: string, seed: number): Promise<boolean> {
  return target.evaluate(
    ({ key, handleKey, elementId, seed }) => {
      const payload = (globalThis as Record<string, unknown>)[Symbol.for(key)] as {
        circle(element: Element, options: { seed: number }): unknown;
      };
      const element = document.getElementById(elementId);
      if (!element) throw new Error(`missing target ${elementId}`);
      (globalThis as Record<string, unknown>)[Symbol.for(handleKey)] = payload.circle(element, { seed });
      return true;
    },
    { key: PAYLOAD_SYMBOL, handleKey: HANDLE_SYMBOL, elementId, seed },
  );
}

/** Emulate helper-owned handle disposal; must not touch authored overlays. */
export async function destroyAttached(target: Target): Promise<void> {
  await target.evaluate((handleKey) => {
    const handle = (globalThis as Record<string, unknown>)[Symbol.for(handleKey)] as {
      destroy(): void;
    };
    handle?.destroy();
    delete (globalThis as Record<string, unknown>)[Symbol.for(handleKey)];
  }, HANDLE_SYMBOL);
}

export async function overlayCount(target: Target, className: string): Promise<number> {
  return target.evaluate((name) => document.querySelectorAll(`.${name}`).length, className);
}
