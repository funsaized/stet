// PW-02 experiment only. This file emulates the future `@funsaized/stet/playwright`
// entry. `tests/pw02/build-payload.mjs` copies it to `dist/playwright/entry.mjs`
// inside the packed package; it is not exported and does not change the public API.
//
// Mechanism selected by PW-01: a prebuilt classic/IIFE payload plus the package
// stylesheet served from same-origin URLs fulfilled with package-local file
// contents. Discovery must be portable, so both assets are located relative to
// this module's own installed URL. No CDN, no consumer bundler, no Playwright
// import (callers pass their own Playwright objects).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PAYLOAD_FILE = fileURLToPath(new URL("./payload.js", import.meta.url));
const STYLE_FILE = fileURLToPath(new URL("../../style.css", import.meta.url));
export const PAYLOAD_SYMBOL = "funsaized.stet.playwright.payload";

export class StetPlaywrightError extends Error {
  constructor(code, message, options) {
    super(message, options);
    this.name = "StetPlaywrightError";
    this.code = code;
  }
}

const isPage = (value) => typeof value?.mainFrame === "function";

// Shared browser-payload realm per page. The IIFE singleton is reused across
// sessions; the last session to dispose drops it. PW-02 records this lifetime as
// evidence for the still-gated loader-resource decision.
const realms = new WeakMap();

function classify(error, session) {
  const text = String(error?.message ?? error);
  let code = "BROWSER_OPERATION";
  if (/execution context was destroyed|most likely because of a navigation|navigat/i.test(text))
    code = "NAVIGATION";
  else if (/page has been closed|context or browser has been closed|browser has been closed/i.test(text))
    code = "PAGE_CLOSED";
  else if (/frame (was |has been )?detached/i.test(text)) code = "FRAME_DETACHED";
  if (code !== "BROWSER_OPERATION") session?.invalidate?.();
  return new StetPlaywrightError(code, `stet playwright: ${text}`, { cause: error });
}

let sequence = 0;

/**
 * @param {import("@playwright/test").Page | import("@playwright/test").Frame} context
 * @param {{ abort?: "payload" | "style" }} [experiment] PW-02-only fault injection.
 */
export async function createStet(context, experiment = {}) {
  const page = isPage(context) ? context : context.page();
  if (!page) throw new StetPlaywrightError("UNSUPPORTED_CONTEXT", "stet playwright: unsupported context");
  const browserContext = page.context();
  const id = `s${++sequence}`;
  const marker = `/__stet__/${id}/`;
  const payloadPath = `${marker}payload.js`;
  const stylePath = `${marker}style.css`;

  // Read at session creation time. This is the discovery step: both files were
  // located from the installed package, never from the repository or a CDN.
  const payloadBody = readFileSync(PAYLOAD_FILE, "utf8");
  const styleBody = readFileSync(STYLE_FILE, "utf8");

  let invalidated = false;
  let disposed = false;
  let acquired = false;
  const injected = [];
  const attached = [];
  const routes = [];

  const installRoutes = async () => {
    await browserContext.route(`**${marker}payload.js`, (route) =>
      experiment.abort === "payload"
        ? route.abort("failed")
        : route.fulfill({ contentType: "text/javascript", body: payloadBody }),
    );
    routes.push(`**${marker}payload.js`);
    await browserContext.route(`**${marker}style.css`, (route) =>
      experiment.abort === "style"
        ? route.abort("failed")
        : route.fulfill({ contentType: "text/css", body: styleBody }),
    );
    routes.push(`**${marker}style.css`);
  };

  const cleanup = async () => {
    for (const pattern of routes.splice(0)) await browserContext.unroute(pattern).catch(() => {});
    for (const node of injected.splice(0)) {
      await node.evaluate((element) => element.remove()).catch(() => {});
    }
    // A rejected addScriptTag/addStyleTag can leave its half-created node behind;
    // sweep only this session's marker so foreign resources are never touched.
    await context
      .evaluate((needle) => {
        for (const node of Array.from(document.querySelectorAll("script[src],link[href]"))) {
          const reference = node.getAttribute("src") ?? node.getAttribute("href") ?? "";
          if (reference.includes(needle)) node.remove();
        }
      }, marker)
      .catch(() => {});
    if (acquired) {
      acquired = false;
      const remaining = (realms.get(page) ?? 1) - 1;
      if (remaining <= 0) {
        realms.delete(page);
        await context
          .evaluate((symbol) => {
            delete globalThis[Symbol.for(symbol)];
          }, PAYLOAD_SYMBOL)
          .catch(() => {});
      } else {
        realms.set(page, remaining);
      }
    }
  };

  try {
    await installRoutes();
    // Stylesheet first so the first painted frame is styled, then the payload.
    injected.push(await context.addStyleTag({ url: stylePath }));
    injected.push(await context.addScriptTag({ url: payloadPath }));
    await context.waitForFunction(
      (symbol) => typeof globalThis[Symbol.for(symbol)]?.runtime === "object",
      PAYLOAD_SYMBOL,
      { timeout: 5000 },
    );
    acquired = true;
    realms.set(page, (realms.get(page) ?? 0) + 1);
  } catch (error) {
    await cleanup();
    throw new StetPlaywrightError(
      "LOAD_FAILED",
      `stet playwright: package-local assets failed to load: ${error?.message ?? error}`,
      { cause: error },
    );
  }

  const ensureLive = () => {
    if (disposed) throw new StetPlaywrightError("SESSION_DISPOSED", "stet playwright: session disposed");
    if (invalidated) throw new StetPlaywrightError("NAVIGATION", "stet playwright: session invalidated by navigation");
  };

  const invoke = async (handleId, method) => {
    ensureLive();
    try {
      return await context.evaluate(
        ({ symbol, id: handle, method: name }) => {
          const payload = globalThis[Symbol.for(symbol)];
          const target = payload?.handles?.get(handle);
          if (!target) return { __stetMissingHandle: true };
          return target[name]();
        },
        { symbol: PAYLOAD_SYMBOL, id: handleId, method },
      );
    } catch (error) {
      throw classify(error, session);
    }
  };

  const session = {
    invalidate() {
      invalidated = true;
    },
    async circle(locator, options = {}) {
      ensureLive();
      let handleId;
      try {
        const count = await locator.count();
        if (count !== 1)
          throw new StetPlaywrightError(
            count === 0 ? "TARGET_MISSING" : "TARGET_AMBIGUOUS",
            `stet playwright: locator matched ${count} elements`,
          );
        handleId = await locator.evaluate(
          (element, { symbol, opts }) => {
            const payload = globalThis[Symbol.for(symbol)];
            const handle = payload.runtime.circle(element, opts);
            const id = payload.next++;
            payload.handles.set(id, handle);
            return id;
          },
          { symbol: PAYLOAD_SYMBOL, opts: options },
        );
      } catch (error) {
        if (error instanceof StetPlaywrightError) throw error;
        throw classify(error, session);
      }
      attached.push(handleId);
      return {
        show: () => invoke(handleId, "show"),
        hide: () => invoke(handleId, "hide"),
        replay: () => invoke(handleId, "replay"),
        refresh: () => invoke(handleId, "refresh"),
        resketch: () => invoke(handleId, "resketch"),
        destroy: () => invoke(handleId, "destroy"),
      };
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      await context
        .evaluate(
          ({ symbol, ids }) => {
            const payload = globalThis[Symbol.for(symbol)];
            if (!payload) return;
            for (const id of ids) {
              payload.handles.get(id)?.destroy();
              payload.handles.delete(id);
            }
          },
          { symbol: PAYLOAD_SYMBOL, ids: attached.splice(0) },
        )
        .catch(() => {});
      await cleanup();
    },
  };
  return session;
}
