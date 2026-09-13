// Optional Node-side Playwright entry (`@funsaized/stet/playwright`).
//
// Mechanism frozen by PW-01/PW-02: Stet's build emits a classic/IIFE browser
// payload beside this entry. The entry discovers the payload and the root
// stylesheet relative to its own installed `import.meta.url`, reads them
// package-locally, and fulfills opaque same-origin URLs through the caller's
// Playwright browser context. The bound Page or same-origin Frame loads those
// URLs with `addScriptTag({ url })` / `addStyleTag({ url })`, so browser CSP
// stays active. No CDN, no consumer bundler, and no runtime Playwright import:
// callers pass their own Playwright objects.
//
// This file owns loading, package boundaries, and the remote session scaffold.
// Locator resolution depth and remote lifecycle semantics are gated by PW-04
// and PW-05; the public signatures here match the approved contract.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ElementHandle, Frame, Locator, Page } from "@playwright/test";
import type {
  ArrowOptions,
  MarkKind,
  StetAnimationResult,
  StetOptions,
  StickyOptions,
} from "../index.js";

export type StetPlaywrightErrorCode =
  | "UNSUPPORTED_CONTEXT"
  | "FRAME_DETACHED"
  | "TARGET_MISSING"
  | "TARGET_AMBIGUOUS"
  | "TARGET_DETACHED"
  | "WRONG_DOCUMENT"
  | "NAVIGATION"
  | "PAGE_CLOSED"
  | "SESSION_DISPOSED"
  | "LOAD_FAILED"
  | "CSP_BLOCKED"
  | "INVALID_OPTIONS"
  | "UNSUPPORTED_ANIMATION"
  | "BROWSER_OPERATION";

export type StetPrimitive = "circle" | "underline" | "highlight" | "arrow" | "sticky" | "mark";
export type StetLocatorRole = "target" | "from" | "to";

export interface StetPlaywrightErrorOptions {
  cause?: unknown;
  primitive?: StetPrimitive;
  role?: StetLocatorRole;
}

export class StetPlaywrightError extends Error {
  readonly code: StetPlaywrightErrorCode;
  readonly primitive?: StetPrimitive;
  readonly role?: StetLocatorRole;

  constructor(
    code: StetPlaywrightErrorCode,
    message: string,
    options: StetPlaywrightErrorOptions = {},
  ) {
    super(message);
    // `Error` options are ES2022; assign the cause directly so the package can
    // keep its ES2020 target and still retain causes at runtime.
    if (options.cause !== undefined) (this as { cause?: unknown }).cause = options.cause;
    this.name = "StetPlaywrightError";
    this.code = code;
    this.primitive = options.primitive;
    this.role = options.role;
  }
}

export interface RemoteStetHandle {
  show(): Promise<StetAnimationResult>;
  hide(): Promise<void>;
  replay(): Promise<StetAnimationResult>;
  refresh(): Promise<void>;
  resketch(seed?: number): Promise<void>;
  destroy(): Promise<void>;
}

export interface StetSession {
  circle(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  underline(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  highlight(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  arrow(from: Locator, to: Locator, options?: ArrowOptions): Promise<RemoteStetHandle>;
  sticky(target: Locator, options: StickyOptions): Promise<RemoteStetHandle>;
  mark(target: Locator, kind: MarkKind, options?: StetOptions): Promise<RemoteStetHandle>;
  dispose(): Promise<void>;
}

// Browser-side shape installed by the generated `payload.js`. Types only; the
// payload file is the authority at runtime.
interface PayloadHandle {
  show(): Promise<StetAnimationResult>;
  hide(): void;
  replay(): Promise<StetAnimationResult>;
  refresh(): void;
  resketch(seed?: number): void;
  destroy(): void;
}

interface Payload {
  runtime: Record<string, (...values: unknown[]) => PayloadHandle>;
  handles: Map<number, PayloadHandle>;
  next: number;
}

interface InternalSession {
  invalidate(code: StetPlaywrightErrorCode): void;
}

interface RemoteState {
  destroyed: boolean;
  operation?: Promise<StetAnimationResult>;
}

const PAYLOAD_FILE = fileURLToPath(new URL("./payload.js", import.meta.url));
const STYLE_FILE = fileURLToPath(new URL("../../style.css", import.meta.url));
const PAYLOAD_SYMBOL = "funsaized.stet.playwright.payload";

const isPage = (value: unknown): value is Page =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { mainFrame?: unknown }).mainFrame === "function";

const isFrame = (value: unknown): value is Frame =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { page?: unknown }).page === "function" &&
  typeof (value as { addScriptTag?: unknown }).addScriptTag === "function";

// Shared browser-payload realm per bound frame, not per page: the IIFE
// singleton is installed in one frame's global, so sessions bound to different
// frames never share or delete each other's runtime. The last session bound to
// a frame drops that frame's payload.
const realms = new WeakMap<Frame, number>();

function classify(
  error: unknown,
  session: InternalSession,
  frame: Frame,
  page: Page,
  primitive?: StetPrimitive,
): StetPlaywrightError {
  const text = String((error as { message?: unknown })?.message ?? error);
  let code: StetPlaywrightErrorCode = "BROWSER_OPERATION";
  if (page.isClosed()) code = "PAGE_CLOSED";
  else if (frame.isDetached()) code = "FRAME_DETACHED";
  else if (/execution context was destroyed|most likely because of a navigation|navigat/i.test(text))
    code = "NAVIGATION";
  else if (/page has been closed|context or browser has been closed|browser has been closed/i.test(text))
    code = "PAGE_CLOSED";
  else if (/frame (was |has been )?detached/i.test(text)) code = "FRAME_DETACHED";
  else if (/stet: animation is not supported/i.test(text))
    code = "UNSUPPORTED_ANIMATION";
  else if (/stet: (?:.*must be|sticky text is required|mark kind)/i.test(text))
    code = "INVALID_OPTIONS";
  if (code === "NAVIGATION" || code === "PAGE_CLOSED" || code === "FRAME_DETACHED")
    session.invalidate(code);
  return new StetPlaywrightError(code, `stet playwright: ${text}`, { cause: error, primitive });
}

let sequence = 0;

/** Create an owned annotation session for a Page or same-origin Frame. */
export async function createStet(context: Page | Frame): Promise<StetSession> {
  const page = isPage(context) ? context : isFrame(context) ? context.page() : null;
  if (!page)
    throw new StetPlaywrightError(
      "UNSUPPORTED_CONTEXT",
      "stet playwright: expected a live Page or Frame",
    );
  if (page.isClosed())
    throw new StetPlaywrightError("PAGE_CLOSED", "stet playwright: page is closed");
  const frame = isPage(context) ? page.mainFrame() : context;
  if (frame.isDetached())
    throw new StetPlaywrightError(
      "UNSUPPORTED_CONTEXT",
      "stet playwright: frame is detached",
    );
  if (frame !== page.mainFrame()) {
    try {
      const [mainOrigin, frameOrigin] = await Promise.all([
        page.mainFrame().evaluate(() => self.origin),
        frame.evaluate(() => self.origin),
      ]);
      if (frameOrigin === "null" || frameOrigin !== mainOrigin)
        throw new StetPlaywrightError(
          "UNSUPPORTED_CONTEXT",
          "stet playwright: frame must be same-origin with the page",
        );
    } catch (error) {
      if (error instanceof StetPlaywrightError) throw error;
      throw new StetPlaywrightError(
        "UNSUPPORTED_CONTEXT",
        "stet playwright: frame is not a live same-origin frame",
        { cause: error },
      );
    }
  }
  const browserContext = page.context();
  const id = `s${++sequence}`;
  const marker = `/__stet__/${id}/`;
  const payloadPath = `${marker}payload.js`;
  const stylePath = `${marker}style.css`;
  const policyKey = `funsaized.stet.playwright.policy.${id}`;

  // Discovery happens at session creation: both files are located relative to
  // the installed entry, never from the repository or a CDN.
  let payloadBody: string;
  let styleBody: string;
  try {
    payloadBody = readFileSync(PAYLOAD_FILE, "utf8");
    styleBody = readFileSync(STYLE_FILE, "utf8");
  } catch (error) {
    throw new StetPlaywrightError(
      "LOAD_FAILED",
      "stet playwright: package-local assets are unavailable; verify the installed package contains dist/playwright/payload.js and style.css",
      { cause: error },
    );
  }

  let invalidated: StetPlaywrightErrorCode | undefined;
  let disposed = false;
  let acquired = false;
  const injected: ElementHandle[] = [];
  const attached = new Map<number, RemoteState>();
  const routes: string[] = [];
  let listening = false;
  let resolveLifecycle!: (code: StetPlaywrightErrorCode) => void;
  const lifecycle = new Promise<StetPlaywrightErrorCode>((resolve) => {
    resolveLifecycle = resolve;
  });

  const setInvalidated = (code: StetPlaywrightErrorCode) => {
    if (!invalidated || code === "FRAME_DETACHED" || code === "PAGE_CLOSED") invalidated = code;
  };
  const releaseDocument = (code: StetPlaywrightErrorCode) => {
    setInvalidated(code);
    resolveLifecycle(invalidated!);
    injected.length = 0;
    acquired = false;
    realms.delete(frame);
    for (const pattern of routes.splice(0)) void browserContext.unroute(pattern).catch(() => {});
  };
  const onNavigated = (navigated: Frame) => {
    if (navigated === frame) releaseDocument("NAVIGATION");
  };
  const onDetached = (detached: Frame) => {
    if (detached === frame) releaseDocument("FRAME_DETACHED");
  };
  const onClosed = () => releaseDocument("PAGE_CLOSED");

  const installRoutes = async () => {
    await browserContext.route(`**${marker}payload.js`, (route) =>
      route.fulfill({ contentType: "text/javascript", body: payloadBody }),
    );
    routes.push(`**${marker}payload.js`);
    await browserContext.route(`**${marker}style.css`, (route) =>
      route.fulfill({ contentType: "text/css", body: styleBody }),
    );
    routes.push(`**${marker}style.css`);
  };

  const installPolicyProbe = () =>
    frame.evaluate((key) => {
      const symbol = Symbol.for(key);
      const violations: string[] = [];
      const listener = (event: SecurityPolicyViolationEvent) => {
        violations.push(event.blockedURI);
      };
      document.addEventListener("securitypolicyviolation", listener);
      (globalThis as unknown as Record<symbol, unknown>)[symbol] = { violations, listener };
    }, policyKey);

  const clearPolicyProbe = async (): Promise<void> => {
    await frame
      .evaluate((key) => {
        const symbol = Symbol.for(key);
        const probe = (
          globalThis as unknown as Record<
            symbol,
            { listener: (event: SecurityPolicyViolationEvent) => void } | undefined
          >
        )[symbol];
        if (probe) document.removeEventListener("securitypolicyviolation", probe.listener);
        delete (globalThis as unknown as Record<symbol, unknown>)[symbol];
      }, policyKey)
      .catch(() => {});
  };

  const policyBlocked = () =>
    frame
      .evaluate(
        ({ key, marker }) => {
          const probe = (
            globalThis as unknown as Record<symbol, { violations: string[] } | undefined>
          )[Symbol.for(key)];
          return Boolean(probe?.violations.some((uri) => uri.includes(marker)));
        },
        { key: policyKey, marker },
      )
      .catch(() => false);

  const cleanup = async () => {
    await clearPolicyProbe();
    if (listening) {
      listening = false;
      page.off("framenavigated", onNavigated);
      page.off("framedetached", onDetached);
      page.off("close", onClosed);
    }
    for (const pattern of routes.splice(0)) await browserContext.unroute(pattern).catch(() => {});
    for (const node of injected.splice(0)) {
      await node.evaluate((element) => (element as Element).remove()).catch(() => {});
    }
    // A rejected addScriptTag/addStyleTag can leave its half-created node behind;
    // sweep only this session's marker so foreign resources are never touched.
    await frame
      .evaluate((needle) => {
        for (const node of Array.from(
          document.querySelectorAll<Element>("script[src],link[href]"),
        )) {
          const reference = node.getAttribute("src") ?? node.getAttribute("href") ?? "";
          if (reference.includes(needle)) node.remove();
        }
      }, marker)
      .catch(() => {});
    if (acquired) {
      acquired = false;
      const remaining = (realms.get(frame) ?? 1) - 1;
      if (remaining <= 0) {
        realms.delete(frame);
        await frame
          .evaluate((symbol) => {
            delete (globalThis as Record<symbol, unknown>)[Symbol.for(symbol)];
          }, PAYLOAD_SYMBOL)
          .catch(() => {});
      } else {
        realms.set(frame, remaining);
      }
    }
  };

  const ensureLive = () => {
    if (disposed)
      throw new StetPlaywrightError("SESSION_DISPOSED", "stet playwright: session disposed");
    if (invalidated)
      throw new StetPlaywrightError(
        invalidated,
        `stet playwright: session invalidated by ${invalidated.toLowerCase()}`,
      );
  };

  const classifyOperation = async (
    error: unknown,
    primitive?: StetPrimitive,
  ): Promise<StetPlaywrightError> => {
    const text = String((error as { message?: unknown })?.message ?? error);
    if (
      frame !== page.mainFrame() &&
      /execution context was destroyed, most likely because of a navigation/i.test(text) &&
      !page.isClosed() &&
      !frame.isDetached()
    ) {
      const code = await lifecycle;
      return new StetPlaywrightError(code, `stet playwright: ${text}`, {
        cause: error,
        primitive,
      });
    }
    return classify(error, session, frame, page, primitive);
  };

  const invoke = async (
    handleId: number,
    method: keyof PayloadHandle,
    argument?: unknown,
  ): Promise<unknown> => {
    ensureLive();
    try {
      return await frame.evaluate(
        (input) => {
          const payload = (
            globalThis as unknown as Record<symbol, Payload | undefined>
          )[Symbol.for(input.symbol)];
          const target = payload?.handles.get(input.id);
          if (!target) throw new Error("stet playwright remote handle is unavailable");
          const call = target[input.method] as unknown as (value?: unknown) => unknown;
          const result = input.argument === undefined ? call.call(target) : call.call(target, input.argument);
          if (input.method === "destroy") payload?.handles.delete(input.id);
          return result;
        },
        { symbol: PAYLOAD_SYMBOL, id: handleId, method, argument },
      );
    } catch (error) {
      throw await classifyOperation(error);
    }
  };

  const remote = (handleId: number, state: RemoteState): RemoteStetHandle => {
    const operation = (method: "show" | "replay") => {
      if (state.destroyed) return Promise.resolve({ status: "cancelled" } as const);
      if (method === "show" && state.operation) return state.operation;
      const promise = invoke(handleId, method) as Promise<StetAnimationResult>;
      state.operation = promise;
      void promise.then(
        () => {
          if (state.operation === promise) state.operation = undefined;
        },
        () => {
          if (state.operation === promise) state.operation = undefined;
        },
      );
      return promise;
    };
    return {
      show: () => operation("show"),
      hide: () => state.destroyed ? Promise.resolve() : invoke(handleId, "hide") as Promise<void>,
      replay: () => operation("replay"),
      refresh: () => state.destroyed ? Promise.resolve() : invoke(handleId, "refresh") as Promise<void>,
      resketch: (seed?: number) => state.destroyed ? Promise.resolve() : invoke(handleId, "resketch", seed) as Promise<void>,
      async destroy() {
        if (state.destroyed) return;
        await invoke(handleId, "destroy");
        state.destroyed = true;
        attached.delete(handleId);
      },
    };
  };

  const attach = async (
    primitive: StetPrimitive,
    locators: Locator[],
    args: unknown[],
  ): Promise<RemoteStetHandle> => {
    ensureLive();
    const handles: ElementHandle[] = [];
    try {
      for (let index = 0; index < locators.length; index += 1) {
        const role: StetLocatorRole = locators.length > 1 ? (index === 0 ? "from" : "to") : "target";
        const snapshot = await locators[index].elementHandles();
        handles.push(...snapshot);
        const owner = snapshot[0] ? await snapshot[0].ownerFrame() : null;
        if (owner && owner !== frame)
          throw new StetPlaywrightError(
            "WRONG_DOCUMENT",
            `stet playwright: ${primitive} ${role} belongs to another document`,
            { primitive, role },
          );
        if (snapshot.length !== 1)
          throw new StetPlaywrightError(
            snapshot.length === 0 ? "TARGET_MISSING" : "TARGET_AMBIGUOUS",
            `stet playwright: ${primitive} ${role} locator matched ${snapshot.length} elements`,
            { primitive, role },
          );
      }
      const result = await frame.evaluate(
        (input) => {
          const payload = (
            globalThis as unknown as Record<symbol, Payload | undefined>
          )[Symbol.for(input.symbol)];
          if (!payload) throw new Error("stet playwright payload is not loaded");
          const elements = input.elements as unknown as Element[];
          const detached = elements.findIndex(
            (element) => !element.isConnected || element.ownerDocument !== document,
          );
          if (detached !== -1) return { detached };
          const handle = payload.runtime[input.primitive](...elements, ...input.args);
          const id = payload.next++;
          payload.handles.set(id, handle);
          return { id };
        },
        { symbol: PAYLOAD_SYMBOL, primitive, args, elements: handles },
      );
      if ("detached" in result) {
        const role: StetLocatorRole = locators.length > 1 ? (result.detached === 0 ? "from" : "to") : "target";
        throw new StetPlaywrightError(
          "TARGET_DETACHED",
          `stet playwright: ${primitive} ${role} target detached before attachment`,
          { primitive, role },
        );
      }
      const handleId = result.id;
      const state: RemoteState = { destroyed: false };
      attached.set(handleId, state);
      return remote(handleId, state);
    } catch (error) {
      if (error instanceof StetPlaywrightError) throw error;
      throw await classifyOperation(error, primitive);
    } finally {
      await Promise.all(handles.map((handle) => handle.dispose()));
    }
  };

  const session: StetSession & InternalSession = {
    invalidate(code) {
      setInvalidated(code);
    },
    circle(target, options = {}) {
      return attach("circle", [target], [options]);
    },
    underline(target, options = {}) {
      return attach("underline", [target], [options]);
    },
    highlight(target, options = {}) {
      return attach("highlight", [target], [options]);
    },
    arrow(from, to, options = {}) {
      return attach("arrow", [from, to], [options]);
    },
    sticky(target, options) {
      return attach("sticky", [target], [options]);
    },
    mark(target, kind, options = {}) {
      return attach("mark", [target], [kind, options]);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      for (const state of attached.values()) state.destroyed = true;
      await frame
        .evaluate(
          (input) => {
            const payload = (
              globalThis as unknown as Record<symbol, Payload | undefined>
            )[Symbol.for(input.symbol)];
            if (!payload) return;
            for (const handle of input.ids) {
              payload.handles.get(handle)?.destroy();
              payload.handles.delete(handle);
            }
          },
          { symbol: PAYLOAD_SYMBOL, ids: [...attached.keys()] },
        )
        .catch(() => {});
      attached.clear();
      await cleanup();
    },
  };

  try {
    await installRoutes();
    await installPolicyProbe();
    // Stylesheet first so the first painted frame is styled, then the payload.
    injected.push(await frame.addStyleTag({ url: stylePath }));
    injected.push(await frame.addScriptTag({ url: payloadPath }));
    await frame.waitForFunction(
      (symbol) => {
        const payload = (
          globalThis as unknown as Record<symbol, Payload | undefined>
        )[Symbol.for(symbol)];
        return typeof payload?.runtime === "object";
      },
      PAYLOAD_SYMBOL,
      { timeout: 5000 },
    );
    await clearPolicyProbe();
    acquired = true;
    realms.set(frame, (realms.get(frame) ?? 0) + 1);
    listening = true;
    page.on("framenavigated", onNavigated);
    page.on("framedetached", onDetached);
    page.on("close", onClosed);
  } catch (error) {
    const blocked = await policyBlocked();
    await cleanup();
    throw new StetPlaywrightError(
      blocked ? "CSP_BLOCKED" : "LOAD_FAILED",
      blocked
        ? "stet playwright: page CSP blocked package-local script or style; allow same-origin script-src and style-src for Stet"
        : `stet playwright: package-local assets failed to load; verify the installed package and browser context: ${
            (error as { message?: unknown })?.message ?? error
          }`,
      { cause: error },
    );
  }

  return session;
}
