import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrow,
  box,
  circle,
  highlight,
  mark,
  sticky,
  underline,
  type StetHandle,
  type StetOptions,
} from "../src/index.js";
import * as stet from "../src/index.js";
import { resolveAnimation, updateHandle } from "../src/mount.js";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  disconnected = false;

  constructor(readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
}

function element(left = 10, top = 20, width = 100, height = 30): HTMLElement {
  const node = document.createElement("div");
  const rect = new DOMRect(left, top, width, height);
  vi.spyOn(node, "getBoundingClientRect").mockReturnValue(rect);
  vi.spyOn(node, "getClientRects").mockReturnValue({
    0: rect,
    length: 1,
    item: (index: number) => (index === 0 ? rect : null),
  });
  document.body.append(node);
  return node;
}

function paths(): string[] {
  return [...document.querySelectorAll<SVGPathElement>(".stet-svg path")].map(
    (path) => path.getAttribute("d") ?? "",
  );
}

beforeEach(() => {
  ResizeObserverMock.instances = [];
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
});

afterEach(() => {
  document.body.textContent = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("attachers", () => {
  it("rejects missing targets and invalid marks", () => {
    expect(() => circle(null as never)).toThrow("expected element");
    expect(() => arrow(element(), null as never)).toThrow("expected to element");
    expect(() => mark(element(), "maybe" as never)).toThrow("mark kind");
  });

  it.each([
    ["box", (node: Element) => box(node, { seed: 42 })],
    ["circle", (node: Element) => circle(node, { seed: 42 })],
    ["underline", (node: Element) => underline(node, { seed: 42 })],
    ["highlight", (node: Element) => highlight(node, { seed: 42 })],
    ["mark", (node: Element) => mark(node, "wrong", { seed: 42 })],
    ["sticky", (node: Element) => sticky(node, { text: "required", seed: 42 })],
  ])("draws deterministic %s paths and cleans up", (_, attach) => {
    const first = attach(element());
    const expected = paths();
    expect(expected.length).toBeGreaterThan(0);
    first.resketch(42);
    expect(paths()).toEqual(expected);
    first.destroy();
    expect(document.querySelector(".stet-overlay")).toBeNull();
    expect(ResizeObserverMock.instances.every((observer) => observer.disconnected)).toBe(true);
  });

  it("draws an arrow and exposes its label as HTML", () => {
    const from = element();
    const to = element(300, 100);
    const handle = arrow(from, to, { label: "click this", seed: 7 });
    const expected = paths();
    expect(document.querySelector(".stet-label")?.textContent).toBe("click this");
    expect(document.querySelector(".stet-svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(to.getAttribute("aria-describedby")).toContain("stet-description-");
    handle.resketch(7);
    expect(paths()).toEqual(expected);
    handle.destroy();
    expect(to.hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps sticky text in real DOM", () => {
    const handle = sticky(element(), { text: "why this matters", seed: 1 });
    expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("why this matters");
    expect(document.querySelector(".stet-sticky-text")?.namespaceURI).toBe(
      "http://www.w3.org/1999/xhtml",
    );
    expect(document.body.firstElementChild?.getAttribute("aria-describedby")).toContain(
      "stet-description-",
    );
    handle.destroy();
  });

  it("uses one static frame and skips hover resketch for reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const node = element();
    const handle: StetHandle = circle(node, { seed: 5 });
    const before = paths();
    expect(before).toHaveLength(1);
    node.dispatchEvent(new PointerEvent("pointerenter"));
    expect(paths()).toEqual(before);
    handle.destroy();
  });

  it("resketches on pointer interaction", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.1).mockReturnValueOnce(0.2);
    const node = element();
    const handle = circle(node, { resketchOnHover: true });
    const before = paths();
    node.dispatchEvent(new PointerEvent("pointerenter"));
    expect(paths()).not.toEqual(before);
    handle.destroy();
  });

  it("draws one circle per wrapped line", () => {
    const node = element();
    const rects = [new DOMRect(10, 20, 100, 20), new DOMRect(10, 40, 60, 20)];
    vi.mocked(node.getClientRects).mockReturnValue({
      0: rects[0],
      1: rects[1],
      length: 2,
      item: (index: number) => rects[index] ?? null,
    });
    const handle = circle(node, { seed: 1, boil: 0 });
    expect(paths()).toHaveLength(2);
    handle.destroy();
  });

  it("repositions without restarting unchanged paths", () => {
    const node = element();
    const handle = circle(node, { seed: 1 });
    const path = document.querySelector(".stet-svg path");
    window.dispatchEvent(new Event("scroll"));
    expect(document.querySelector(".stet-svg path")).toBe(path);
    handle.destroy();
  });

  it("places horizontal arrows outside wide targets", () => {
    const handle = arrow(element(0, 0, 300, 30), element(500, 0, 100, 30), {
      seed: 1,
      roughness: 0,
      boil: 0,
    });
    expect(document.querySelector<HTMLElement>(".stet-overlay")?.style.left).toBe("288px");
    handle.destroy();
  });

  it("honors per-call mark stroke", () => {
    const handle = mark(element(), "wrong", { stroke: "purple" });
    expect(
      document.querySelector<HTMLElement>(".stet-overlay")?.style.getPropertyValue("--stet-ink"),
    ).toBe("purple");
    handle.destroy();
  });

  it("stays still by default", () => {
    const node = element();
    const handle = circle(node, { seed: 42 });
    const before = paths();
    expect(before).toHaveLength(1);
    node.dispatchEvent(new PointerEvent("pointerenter"));
    node.dispatchEvent(new PointerEvent("pointerdown"));
    expect(paths()).toEqual(before);
    handle.destroy();
  });

  it("refreshes movement without changing the seed or replacing paths", () => {
    const node = element();
    const handle = circle(node, { seed: 4 });
    const path = document.querySelector("path");
    const rect = new DOMRect(110, 120, 100, 30);
    vi.mocked(node.getBoundingClientRect).mockReturnValue(rect);
    vi.mocked(node.getClientRects).mockReturnValue([rect] as unknown as DOMRectList);
    handle.refresh();
    expect(document.querySelector<HTMLElement>(".stet-overlay")?.style.left).toBe("105px");
    expect(document.querySelector("path")).toBe(path);
    handle.destroy();
    handle.refresh();
    handle.resketch();
    handle.destroy();
    expect(document.querySelector(".stet-overlay")).toBeNull();
  });

  it("keeps independent descriptions and later application ARIA changes", () => {
    const node = element();
    node.setAttribute("aria-describedby", "existing");
    const first = circle(node, { description: "Required" });
    const second = sticky(node, { text: "Work email" });
    node.setAttribute("aria-describedby", `${node.getAttribute("aria-describedby")} added-later`);
    first.destroy();
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    second.destroy();
    expect(node.getAttribute("aria-describedby")).toBe("existing added-later");
  });

  it("does not generate invalid coordinates for coincident arrow anchors", () => {
    const node = element();
    const handle = arrow(node, node, { seed: 1 });
    expect(paths().join("")).not.toMatch(/NaN|Infinity/);
    handle.destroy();
  });

  it("flips a preferred sticky side when it would leave the viewport", () => {
    const handle = sticky(element(920, 300, 80, 30), { text: "Stay visible", side: "right" });
    const overlay = document.querySelector<HTMLElement>(".stet-overlay")!;
    expect(parseFloat(overlay.style.left) + parseFloat(overlay.style.width)).toBeLessThan(1024);
    expect(parseFloat(overlay.style.top)).toBeGreaterThan(330);
    handle.destroy();
  });

  it("can attach a meaningful annotation to an initially offscreen target", () => {
    const node = element(20, 1400);
    const handle = sticky(node, { text: "Read when visible" });
    expect(document.querySelector<HTMLElement>(".stet-overlay")?.hidden).toBe(true);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    handle.destroy();
    expect(node.hasAttribute("aria-describedby")).toBe(false);
  });

  it("snapshots caller options instead of observing accidental mutations", () => {
    const options = { seed: 1, padding: 3 };
    const handle = circle(element(), options);
    const before = paths();
    options.padding = 30;
    handle.refresh();
    expect(paths()).toEqual(before);
    handle.destroy();
  });
});

describe("animation options", () => {
  it("keeps advertised defaults static", () => {
    const caps = JSON.parse(readFileSync("agent/capabilities.json", "utf8"));
    expect(resolveAnimation(caps.primitives.circle.defaults).enabled).toBe(false);
    expect(resolveAnimation(caps.primitives.underline.defaults).enabled).toBe(false);
  });

  it.each([
    [{}, { enabled: false, duration: 600, delay: 0 }],
    [{ animate: false }, { enabled: false, duration: 600, delay: 0 }],
    [{ animate: true }, { enabled: true, duration: 600, delay: 0 }],
    [{ animationDuration: 250 }, { enabled: true, duration: 250, delay: 0 }],
    [{ animationDelay: 40 }, { enabled: true, duration: 600, delay: 40 }],
    [
      { animate: false, animationDuration: 250, animationDelay: 40 },
      { enabled: false, duration: 250, delay: 40 },
    ],
  ])("resolves %j", (options, expected) => {
    expect(resolveAnimation(options)).toEqual(expected);
  });

  it.each(["animationDuration", "animationDelay"] as const)(
    "rejects invalid %s before DOM or ARIA mutation",
    (name) => {
      for (const attach of [circle, underline, highlight]) {
        for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
          const node = element();
          node.setAttribute("aria-describedby", "native");
          expect(() => attach(node, { animate: false, visible: false, [name]: value })).toThrow(
            RangeError,
          );
          expect(document.querySelector(".stet-overlay")).toBeNull();
          expect(node.getAttribute("aria-describedby")).toBe("native");
          node.remove();
        }
      }
    },
  );

  const unsupported = [
    ["highlight", (node: Element, options: StetOptions) => highlight(node, options)],
    ["mark", (node: Element, options: StetOptions) => mark(node, "right", options)],
    [
      "arrow",
      (node: Element, options: StetOptions) =>
        arrow(element(300, 100), node, { label: "To", ...options }),
    ],
    ["sticky", (node: Element, options: StetOptions) => sticky(node, { text: "Note", ...options })],
  ] as const;

  it.each(unsupported)("rejects enabled animation on %s before mutation", (_, attach) => {
    for (const options of [
      { animate: true },
      { animationDelay: 1 },
      { animationDuration: 1, visible: false },
    ]) {
      const node = element();
      node.setAttribute("aria-describedby", "native");
      expect(() => attach(node, options)).toThrow(TypeError);
      expect(document.querySelector(".stet-overlay")).toBeNull();
      expect(node.getAttribute("aria-describedby")).toBe("native");
      document.body.replaceChildren();
    }
  });

  it.each(unsupported)("allows animate:false timing on static %s", (_, attach) => {
    const handle = attach(element(), { animate: false, animationDuration: 10, animationDelay: 5 });
    expect(document.querySelector(".stet-overlay")?.hidden).toBe(false);
    handle.destroy();
  });

  it("accepts enabled animation options for box, circle, and underline", () => {
    for (const attach of [box, circle, underline]) {
      const handle = attach(element(), { animate: true, animationDuration: 0, animationDelay: 0 });
      handle.destroy();
    }
  });
});

// Stroked primitives ride the same path-length mechanism.
describe.each(["box", "circle", "underline"] as const)("%s reveal parity", (primitive) => {
  const attach = { box, circle, underline }[primitive];
  const path = () => document.querySelector<SVGPathElement>(`.stet-overlay--${primitive} path`)!;
  const offset = () => path().getAttribute("stroke-dashoffset");
  const overlay = () => document.querySelector<HTMLElement>(`.stet-overlay--${primitive}`)!;

  it("draws on with path-length dashes, never opacity, and settles final", () => {
    vi.useFakeTimers();
    const handle = attach(element(), { seed: 1, animate: true, animationDuration: 400 });
    // Frame zero is fully hidden but already carries its final geometry: no flash.
    expect(path().getAttribute("pathLength")).toBe("1");
    expect(path().getAttribute("stroke-dasharray")).toBe("1");
    expect(offset()).toBe("1");
    expect(path().getAttribute("d")).toBeTruthy();
    expect(path().hasAttribute("opacity")).toBe(false);
    vi.advanceTimersByTime(200);
    const mid = Number(offset());
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
    expect(path().hasAttribute("opacity")).toBe(false);
    vi.advanceTimersByTime(400);
    // Settled frame drops every reveal attribute and keeps the static path.
    expect(path().hasAttribute("pathLength")).toBe(false);
    expect(path().hasAttribute("stroke-dasharray")).toBe(false);
    expect(offset()).toBeNull();
    expect(path().hasAttribute("opacity")).toBe(false);
    handle.destroy();
  });

  it("keeps settled geometry identical to the static annotation", () => {
    vi.useFakeTimers();
    const staticHandle = attach(element(), { seed: 11 });
    const staticPath = path();
    expect(staticPath.hasAttribute("pathLength")).toBe(false);
    const settledD = staticPath.getAttribute("d");
    expect(settledD).toBeTruthy();
    staticHandle.destroy();
    document.body.replaceChildren();

    const handle = attach(element(), { seed: 11, animate: true, animationDuration: 200 });
    vi.advanceTimersByTime(400);
    expect(offset()).toBeNull();
    expect(path().hasAttribute("pathLength")).toBe(false);
    expect(path().getAttribute("d")).toBe(settledD);
    handle.destroy();
  });

  it("redraws at current progress without replay on refresh, resketch, scroll and resize", () => {
    vi.useFakeTimers();
    const node = element();
    const handle = attach(node, { seed: 1, animate: true, animationDuration: 600 });
    vi.advanceTimersByTime(300);
    const before = Number(offset());
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(1);
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    handle.refresh();
    handle.resketch(9);
    const after = Number(offset());
    // A replay would jump back toward 1; progress can only advance.
    expect(after).toBeLessThanOrEqual(before);
    vi.advanceTimersByTime(320);
    expect(offset()).toBeNull();
    handle.destroy();
  });

  it("defers an initial visible:false reveal until show and never runs it early", async () => {
    vi.useFakeTimers();
    const handle = attach(element(), {
      seed: 1,
      visible: false,
      animate: true,
      animationDuration: 200,
    });
    expect(overlay().hidden).toBe(true);
    expect(offset()).toBeNull();
    vi.advanceTimersByTime(500);
    expect(overlay().hidden).toBe(true);
    expect(offset()).toBeNull();
    // show() joins the new operation, so its promise settles on completion.
    const reveal = handle.show();
    expect(overlay().hidden).toBe(false);
    expect(offset()).toBe("1");
    vi.advanceTimersByTime(300);
    expect(offset()).toBeNull();
    await expect(reveal).resolves.toEqual({ status: "finished" });
    handle.destroy();
  });

  it("completes while offscreen and shows the final frame once unculled", () => {
    vi.useFakeTimers();
    const node = element(20, 1400);
    const handle = attach(node, { seed: 1, animate: true, animationDuration: 200 });
    expect(overlay().hidden).toBe(true);
    vi.advanceTimersByTime(500);
    expect(offset()).toBeNull();
    const onscreen = new DOMRect(10, 20, 100, 30);
    vi.mocked(node.getBoundingClientRect).mockReturnValue(onscreen);
    vi.mocked(node.getClientRects).mockReturnValue([onscreen] as unknown as DOMRectList);
    handle.refresh();
    expect(overlay().hidden).toBe(false);
    expect(offset()).toBeNull();
    handle.destroy();
  });

  it("completes while detached and reconnects at the final frame", () => {
    vi.useFakeTimers();
    const node = element();
    const handle = attach(node, { seed: 1, animate: true, animationDuration: 200 });
    node.remove();
    handle.refresh();
    expect(overlay().hidden).toBe(true);
    vi.advanceTimersByTime(500);
    expect(offset()).toBeNull();
    document.body.prepend(node);
    handle.refresh();
    expect(overlay().hidden).toBe(false);
    expect(offset()).toBeNull();
    handle.destroy();
  });

  it("settles immediately under reduced motion and for zero duration", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const reduced = attach(element(), { seed: 1, animate: true, animationDuration: 200 });
    expect(path().hasAttribute("stroke-dashoffset")).toBe(false);
    expect(path().hasAttribute("pathLength")).toBe(false);
    reduced.destroy();
    document.body.replaceChildren();

    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const zero = attach(element(), {
      seed: 1,
      animate: true,
      animationDuration: 0,
      animationDelay: 500,
    });
    expect(path().hasAttribute("stroke-dashoffset")).toBe(false);
    zero.destroy();
  });

  it("leaves a static annotation free of reveal attributes across refresh", () => {
    const handle = attach(element(), { seed: 1 });
    expect(path().hasAttribute("pathLength")).toBe(false);
    expect(path().hasAttribute("stroke-dasharray")).toBe(false);
    expect(path().hasAttribute("stroke-dashoffset")).toBe(false);
    handle.refresh();
    expect(offset()).toBeNull();
    handle.destroy();
  });
});

// CORE-05: one async operation per handle. Every row of the runtime contract
// transition table runs for both stroked primitives against identical behavior.
describe.each(["box", "circle", "underline"] as const)(
  "%s operation state machine",
  (primitive) => {
    const attach = { box, circle, underline }[primitive];
    const overlay = () => document.querySelector<HTMLElement>(`.stet-overlay--${primitive}`)!;
    const path = () => document.querySelector<SVGPathElement>(`.stet-overlay--${primitive} path`)!;
    const offset = () => path().getAttribute("stroke-dashoffset");
    const reducedMotion = (initial: boolean) => {
      let matches = initial;
      const listeners = new Set<() => void>();
      return {
        get matches() {
          return matches;
        },
        addEventListener: (_type: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners.delete(listener);
        },
        set(value: boolean) {
          matches = value;
          for (const listener of listeners) listener();
        },
      };
    };

    it("joins the attach operation exactly and returns a distinct finished show when settled", async () => {
      vi.useFakeTimers();
      const handle = attach(element(), { seed: 1, animate: true, animationDuration: 200 });
      expect(overlay().hidden).toBe(false);
      expect(offset()).toBe("1");
      const joined = handle.show();
      expect(handle.show()).toBe(joined);
      handle.refresh();
      handle.resketch(2);
      expect(handle.show()).toBe(joined);
      vi.advanceTimersByTime(250);
      await expect(joined).resolves.toEqual({ status: "finished" });
      // Settled-visible show is a new fulfilled result and must not redraw.
      const settledPath = path();
      const settled = handle.show();
      expect(settled).not.toBe(joined);
      await expect(settled).resolves.toEqual({ status: "finished" });
      expect(path()).toBe(settledPath);
      handle.destroy();
    });

    it("returns the same promise while delaying and reveals at the deadline", async () => {
      vi.useFakeTimers();
      const handle = attach(element(), {
        seed: 1,
        animate: true,
        animationDelay: 100,
        animationDuration: 200,
      });
      expect(offset()).toBe("1");
      const joined = handle.show();
      expect(handle.show()).toBe(joined);
      vi.advanceTimersByTime(120);
      const mid = Number(offset());
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(1);
      vi.advanceTimersByTime(250);
      await expect(joined).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("starts an operation on show after hidden attach and restores ARIA", async () => {
      vi.useFakeTimers();
      const node = element();
      const handle = attach(node, {
        seed: 1,
        visible: false,
        animate: true,
        animationDuration: 200,
        description: "Required",
      });
      expect(overlay().hidden).toBe(true);
      expect(node.hasAttribute("aria-describedby")).toBe(false);
      const reveal = handle.show();
      expect(overlay().hidden).toBe(false);
      expect(offset()).toBe("1");
      expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
      expect(handle.show()).toBe(reveal);
      vi.advanceTimersByTime(250);
      await expect(reveal).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("starts a fresh operation on show after explicit hide", async () => {
      vi.useFakeTimers();
      const node = element();
      const handle = attach(node, {
        seed: 1,
        animate: true,
        animationDuration: 200,
        description: "Required",
      });
      vi.advanceTimersByTime(250);
      handle.hide();
      expect(overlay().hidden).toBe(true);
      expect(node.hasAttribute("aria-describedby")).toBe(false);
      const reveal = handle.show();
      expect(overlay().hidden).toBe(false);
      expect(offset()).toBe("1");
      expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
      vi.advanceTimersByTime(250);
      await expect(reveal).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("returns a new finished promise for settled-visible static show without redrawing", async () => {
      const handle = attach(element(), { seed: 1 });
      const settledPath = path();
      const first = handle.show();
      const second = handle.show();
      expect(first).not.toBe(second);
      await expect(first).resolves.toEqual({ status: "finished" });
      await expect(second).resolves.toEqual({ status: "finished" });
      expect(path()).toBe(settledPath);
      handle.destroy();
    });

    it("replays a settled operation with the same seed and a distinct promise", async () => {
      vi.useFakeTimers();
      const handle = attach(element(), { seed: 1, animate: true, animationDuration: 200 });
      vi.advanceTimersByTime(250);
      const seeded = path().getAttribute("d");
      const replay = handle.replay();
      expect(overlay().hidden).toBe(false);
      expect(offset()).toBe("1");
      vi.advanceTimersByTime(250);
      await expect(replay).resolves.toEqual({ status: "finished" });
      expect(path().getAttribute("d")).toBe(seeded);
      handle.destroy();
    });

    it("replays a static handle into a new finished promise at the same seed", async () => {
      const handle = attach(element(), { seed: 1 });
      const seeded = path().getAttribute("d");
      const first = handle.replay();
      const second = handle.replay();
      expect(first).not.toBe(second);
      await expect(first).resolves.toEqual({ status: "finished" });
      await expect(second).resolves.toEqual({ status: "finished" });
      expect(path().getAttribute("d")).toBe(seeded);
      handle.destroy();
    });

    it("replays from explicit hide by restoring visibility and ARIA", async () => {
      vi.useFakeTimers();
      const node = element();
      const handle = attach(node, {
        seed: 1,
        animate: true,
        animationDuration: 200,
        description: "Required",
      });
      vi.advanceTimersByTime(250);
      handle.hide();
      expect(node.hasAttribute("aria-describedby")).toBe(false);
      const replay = handle.replay();
      expect(overlay().hidden).toBe(false);
      expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
      vi.advanceTimersByTime(250);
      await expect(replay).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("supersedes an in-flight operation on replay, cancelling it before the replacement settles", async () => {
      vi.useFakeTimers();
      const handle = attach(element(), {
        seed: 1,
        animate: true,
        animationDelay: 200,
        animationDuration: 400,
      });
      vi.advanceTimersByTime(100);
      const old = handle.show();
      const order: string[] = [];
      old.then(() => order.push("old"));
      const next = handle.replay();
      expect(next).not.toBe(old);
      next.then(() => order.push("new"));
      // A following show joins the replacement, not the cancelled operation.
      expect(handle.show()).toBe(next);
      await vi.advanceTimersByTimeAsync(1000);
      await expect(old).resolves.toEqual({ status: "cancelled" });
      await expect(next).resolves.toEqual({ status: "finished" });
      expect(order).toEqual(["old", "new"]);
      handle.destroy();
    });

    it("cancels exactly once on hide and never settles finished late", async () => {
      vi.useFakeTimers();
      const handle = attach(element(), { seed: 1, animate: true, animationDuration: 400 });
      const op = handle.show();
      const statuses: string[] = [];
      op.then((result) => statuses.push(result.status));
      handle.hide();
      handle.hide();
      await expect(op).resolves.toEqual({ status: "cancelled" });
      await vi.advanceTimersByTimeAsync(2000);
      handle.refresh();
      handle.resketch(5);
      await Promise.resolve();
      expect(statuses).toEqual(["cancelled"]);
      expect(offset()).toBeNull();
      handle.destroy();
    });

    it("cancels on destroy and returns fresh cancelled promises after teardown", async () => {
      vi.useFakeTimers();
      const node = element();
      const handle = attach(node, {
        seed: 1,
        animate: true,
        animationDuration: 400,
        description: "Required",
      });
      const op = handle.show();
      handle.destroy();
      await expect(op).resolves.toEqual({ status: "cancelled" });
      const show = handle.show();
      const replay = handle.replay();
      expect(show).not.toBe(replay);
      await expect(show).resolves.toEqual({ status: "cancelled" });
      await expect(replay).resolves.toEqual({ status: "cancelled" });
      // Void calls are harmless no-ops after teardown.
      handle.destroy();
      handle.hide();
      handle.refresh();
      handle.resketch(3);
      expect(overlay()).toBeNull();
      expect(node.hasAttribute("aria-describedby")).toBe(false);
      await vi.advanceTimersByTimeAsync(1000);
    });

    it("creates no operation for zero duration or reduced motion", async () => {
      vi.useFakeTimers();
      vi.stubGlobal("matchMedia", () => ({ matches: true }));
      const reduced = attach(element(), { seed: 1, animate: true, animationDuration: 200 });
      expect(offset()).toBeNull();
      const first = reduced.show();
      const second = reduced.show();
      expect(first).not.toBe(second);
      await expect(first).resolves.toEqual({ status: "finished" });
      reduced.destroy();
      document.body.replaceChildren();

      vi.stubGlobal("matchMedia", () => ({ matches: false }));
      const zero = attach(element(), {
        seed: 1,
        animate: true,
        animationDuration: 0,
        animationDelay: 500,
      });
      expect(offset()).toBeNull();
      zero.hide();
      await expect(zero.show()).resolves.toEqual({ status: "finished" });
      expect(overlay().hidden).toBe(false);
      zero.destroy();
    });

    it("keeps an initially hidden handle settled even under zero duration", () => {
      vi.useFakeTimers();
      const handle = attach(element(), {
        seed: 1,
        visible: false,
        animate: true,
        animationDuration: 0,
      });
      expect(overlay().hidden).toBe(true);
      expect(offset()).toBeNull();
      handle.destroy();
    });

    it("settles an active operation finished when reduced motion becomes active", async () => {
      vi.useFakeTimers();
      const media = reducedMotion(false);
      vi.stubGlobal("matchMedia", () => media);
      const handle = attach(element(), { seed: 1, animate: true, animationDuration: 400 });
      const op = handle.show();
      vi.advanceTimersByTime(100);
      expect(offset()).not.toBeNull();
      media.set(true);
      expect(offset()).toBeNull();
      await expect(op).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });
  },
);

describe("visibility and ARIA ownership", () => {
  const overlay = () => document.querySelector<HTMLElement>(".stet-overlay");

  it("defaults to visible with descriptions attached and a settled show", async () => {
    const node = element();
    const handle = circle(node, { seed: 7, description: "Required" });
    const path = document.querySelector(".stet-svg path");
    expect(overlay()?.hidden).toBe(false);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    // Settled-visible show is a distinct fulfilled result that must not redraw.
    const firstShow = handle.show();
    const secondShow = handle.show();
    expect(firstShow).not.toBe(secondShow);
    await expect(firstShow).resolves.toEqual({ status: "finished" });
    expect(document.querySelector(".stet-svg path")).toBe(path);
    expect(overlay()?.hidden).toBe(false);
    handle.destroy();
  });

  it.each([
    ["circle", (node: Element) => circle(node, { description: "Required", visible: false })],
    ["underline", (node: Element) => underline(node, { description: "Required", visible: false })],
    ["highlight", (node: Element) => highlight(node, { description: "Required", visible: false })],
    ["mark", (node: Element) => mark(node, "right", { description: "Required", visible: false })],
    ["sticky", (node: Element) => sticky(node, { text: "Required", visible: false })],
  ])("initial visible:false hides %s and detaches its own ARIA", (_, attach) => {
    const node = element();
    node.setAttribute("aria-describedby", "native");
    const handle = attach(node);
    expect(overlay()?.hidden).toBe(true);
    expect(node.getAttribute("aria-describedby")).toBe("native");
    handle.destroy();
  });

  it("initial visible:false hides arrow labels and detaches the destination description", () => {
    const to = element(300, 100);
    to.setAttribute("aria-describedby", "native");
    const handle = arrow(element(), to, { label: "Destination", visible: false });
    expect(overlay()?.hidden).toBe(true);
    expect(to.getAttribute("aria-describedby")).toBe("native");
    handle.destroy();
  });

  it("explicit hide survives refresh, resize, scroll and resketch until show", async () => {
    const node = element();
    const handle = circle(node, { seed: 1, description: "Required" });
    handle.hide();
    expect(overlay()?.hidden).toBe(true);
    expect(node.hasAttribute("aria-describedby")).toBe(false);
    handle.refresh();
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));
    handle.resketch(2);
    expect(overlay()?.hidden).toBe(true);
    expect(node.hasAttribute("aria-describedby")).toBe(false);
    await expect(handle.show()).resolves.toEqual({ status: "finished" });
    expect(overlay()?.hidden).toBe(false);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    handle.hide();
    expect(node.hasAttribute("aria-describedby")).toBe(false);
    handle.destroy();
  });

  it("show restores each owned description once and preserves foreign IDs", async () => {
    const node = element();
    node.setAttribute("aria-describedby", "native");
    const handle = circle(node, { description: "Required", visible: false });
    expect(node.getAttribute("aria-describedby")).toBe("native");
    await handle.show();
    const owned = node.getAttribute("aria-describedby")!;
    expect(owned.startsWith("native ")).toBe(true);
    expect(owned.match(/stet-description-/g)).toHaveLength(1);
    await handle.show();
    expect(node.getAttribute("aria-describedby")).toBe(owned);
    handle.destroy();
    expect(node.getAttribute("aria-describedby")).toBe("native");
  });

  it("removes only owned IDs when the application changes ARIA while hidden", async () => {
    const node = element();
    const handle = circle(node, { description: "Required" });
    handle.hide();
    node.setAttribute("aria-describedby", "later");
    await handle.show();
    const after = node.getAttribute("aria-describedby")!;
    expect(after.match(/stet-description-/g)).toHaveLength(1);
    expect(after.split(/\s+/)).toContain("later");
    handle.destroy();
    expect(node.getAttribute("aria-describedby")).toBe("later");
  });

  it("viewport culling hides the overlay but preserves descriptions", () => {
    const node = element();
    const handle = sticky(node, { text: "Note", seed: 1 });
    expect(overlay()?.hidden).toBe(false);
    const offscreen = new DOMRect(10, 2000, 100, 30);
    vi.mocked(node.getBoundingClientRect).mockReturnValue(offscreen);
    vi.mocked(node.getClientRects).mockReturnValue([offscreen] as unknown as DOMRectList);
    handle.refresh();
    expect(overlay()?.hidden).toBe(true);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    const onscreen = new DOMRect(10, 20, 100, 30);
    vi.mocked(node.getBoundingClientRect).mockReturnValue(onscreen);
    vi.mocked(node.getClientRects).mockReturnValue([onscreen] as unknown as DOMRectList);
    handle.refresh();
    expect(overlay()?.hidden).toBe(false);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    handle.destroy();
  });

  it("owns mount, arrow label and sticky text ARIA through hide/show/destroy", async () => {
    const node = element();
    const to = element(300, 100);
    node.setAttribute("aria-describedby", "sticky-native");
    to.setAttribute("aria-describedby", "arrow-native");
    const arrowHandle = arrow(element(600, 200), to, {
      label: "Destination",
      seed: 1,
      visible: false,
    });
    const stickyHandle = sticky(node, { text: "Note", seed: 1, visible: false });
    expect(to.getAttribute("aria-describedby")).toBe("arrow-native");
    expect(node.getAttribute("aria-describedby")).toBe("sticky-native");
    await expect(arrowHandle.show()).resolves.toEqual({ status: "finished" });
    await expect(stickyHandle.show()).resolves.toEqual({ status: "finished" });
    to.setAttribute("aria-describedby", `${to.getAttribute("aria-describedby")} arrow-later`);
    node.setAttribute("aria-describedby", `${node.getAttribute("aria-describedby")} sticky-later`);
    expect(to.getAttribute("aria-describedby")).toContain("stet-description-");
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    arrowHandle.hide();
    stickyHandle.hide();
    expect(to.getAttribute("aria-describedby")).toBe("arrow-native arrow-later");
    expect(node.getAttribute("aria-describedby")).toBe("sticky-native sticky-later");
    await expect(arrowHandle.replay()).resolves.toEqual({ status: "finished" });
    await expect(stickyHandle.replay()).resolves.toEqual({ status: "finished" });
    expect(to.getAttribute("aria-describedby")?.match(/stet-description-/g)).toHaveLength(1);
    expect(node.getAttribute("aria-describedby")?.match(/stet-description-/g)).toHaveLength(1);
    arrowHandle.destroy();
    stickyHandle.destroy();
    expect(to.getAttribute("aria-describedby")).toBe("arrow-native arrow-later");
    expect(node.getAttribute("aria-describedby")).toBe("sticky-native sticky-later");
  });

  it("returns the complete handle from arrow and sticky", () => {
    const circleHandle = circle(element(), { seed: 1 });
    const expected = Object.keys(circleHandle).sort();
    const handles: StetHandle[] = [
      arrow(element(), element(300, 100), { label: "Destination", seed: 1 }),
      sticky(element(), { text: "Note", seed: 1 }),
    ];
    for (const candidate of handles) {
      expect(Object.keys(candidate).sort()).toEqual(expected);
      for (const method of expected) {
        expect(typeof (candidate as unknown as Record<string, unknown>)[method]).toBe("function");
      }
      candidate.destroy();
    }
    circleHandle.destroy();
  });

  it("no-ops after destroy and returns a cancelled show", async () => {
    const node = element();
    const handle = circle(node, { seed: 1, description: "Required" });
    handle.destroy();
    handle.destroy();
    handle.hide();
    handle.refresh();
    handle.resketch(3);
    await expect(handle.show()).resolves.toEqual({ status: "cancelled" });
    expect(overlay()).toBeNull();
    expect(node.hasAttribute("aria-describedby")).toBe(false);
  });
});

// Compare advertised defaults to observable runtime output, not renderer source text.
it("agent capability defaults reproduce omitted runtime defaults", () => {
  const caps = JSON.parse(readFileSync("agent/capabilities.json", "utf8"));
  const from = element(),
    to = element(320, 100);
  for (const [name, meta] of Object.entries<any>(caps.primitives)) {
    const required =
      name === "sticky"
        ? { text: "Review first." }
        : name === "arrow"
          ? { label: "Destination" }
          : {};
    const defaults = Object.fromEntries(
      Object.entries(meta.defaults).filter(
        ([, v]) => typeof v === "number" || typeof v === "boolean" || v === "auto",
      ),
    );
    const attach = (options: any) =>
      name === "mark"
        ? mark(from, "wrong", options)
        : name === "arrow"
          ? arrow(from, to, options)
          : ({ box, circle, underline, highlight, sticky } as any)[name](from, options);
    const implicit = attach({ ...required, seed: 42 });
    const snapshot = () => ({
      paths: paths(),
      position: document.querySelector<HTMLElement>(".stet-overlay")!.style.cssText,
    });
    const expected = snapshot();
    from.dispatchEvent(new Event("pointerenter"));
    expect(snapshot()).toEqual(expected);
    implicit.destroy();
    const explicit = attach({ ...required, ...defaults, seed: 42 });
    expect(snapshot()).toEqual(expected);
    explicit.destroy();
  }
});

it("nudges notes after side selection and clamps them to the viewport", () => {
  const node = element(300, 300, 100, 30);
  let handle = sticky(node, { text: "Evidence", side: "right", seed: 2 });
  const read = () => {
    const style = document.querySelector<HTMLElement>(".stet-overlay--sticky")!.style;
    return [parseFloat(style.left), parseFloat(style.top)];
  };
  const baseline = read();
  handle.destroy();
  handle = sticky(node, { text: "Evidence", side: "right", seed: 2, offsetX: 25, offsetY: -20 });
  expect(read()).toEqual([baseline[0] + 25, baseline[1] - 20]);
  handle.refresh();
  expect(read()).toEqual([baseline[0] + 25, baseline[1] - 20]);
  handle.destroy();
  handle = sticky(node, { text: "Evidence", offsetX: -10000, offsetY: -10000 });
  expect(read()).toEqual([12, 12]);
  handle.destroy();
});

it("moves an arrow label independently of its path and retains viewport clamping", () => {
  const from = element(300, 300),
    to = element(600, 400);
  const read = () => {
    const style = document.querySelector<HTMLElement>(".stet-label")!.style;
    return [parseFloat(style.left), parseFloat(style.top)];
  };
  let handle = arrow(from, to, { label: "Review", seed: 2 });
  const baseline = read(),
    path = paths();
  handle.destroy();
  handle = arrow(from, to, { label: "Review", seed: 2, labelOffsetX: -25, labelOffsetY: 20 });
  expect(read()).toEqual([baseline[0] - 25, baseline[1] + 20]);
  expect(paths()).toEqual(path);
  handle.refresh();
  expect(read()).toEqual([baseline[0] - 25, baseline[1] + 20]);
  handle.destroy();
  handle = arrow(from, to, { label: "Review", labelOffsetX: -10000, labelOffsetY: -10000 });
  const label = document.querySelector<HTMLElement>(".stet-label")!;
  const root = label.parentElement!;
  expect(parseFloat(root.style.left) + parseFloat(label.style.left)).toBe(8);
  expect(parseFloat(root.style.top) + parseFloat(label.style.top)).toBe(8);
  handle.destroy();
});

// CORE-06: reveal composes with ambient boil, hover resketch, and live media
// changes without replaying or changing an in-flight operation's deadline.
describe.each(["box", "circle", "underline"] as const)(
  "%s ambient motion composition",
  (primitive) => {
    const attach = { box, circle, underline }[primitive];
    const overlay = () => document.querySelector<HTMLElement>(`.stet-overlay--${primitive}`)!;
    const drawn = () => [
      ...document.querySelectorAll<SVGPathElement>(`.stet-overlay--${primitive} path`),
    ];
    const first = () => drawn()[0];
    const offset = () => first().getAttribute("stroke-dashoffset");
    const reducedMotion = (initial: boolean) => {
      let matches = initial;
      const listeners = new Set<() => void>();
      return {
        get matches() {
          return matches;
        },
        addEventListener: (_type: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners.delete(listener);
        },
        set(value: boolean) {
          matches = value;
          for (const listener of listeners) listener();
        },
      };
    };

    it("settles finished at the final frame when reduced motion activates during the delay", async () => {
      vi.useFakeTimers();
      const media = reducedMotion(false);
      vi.stubGlobal("matchMedia", () => media);
      const handle = attach(element(), {
        seed: 1,
        animate: true,
        animationDelay: 200,
        animationDuration: 400,
      });
      const op = handle.show();
      expect(offset()).toBe("1");
      media.set(true);
      // The delay is skipped entirely and the final static frame has no reveal state.
      expect(offset()).toBeNull();
      expect(first().hasAttribute("pathLength")).toBe(false);
      expect(overlay().hidden).toBe(false);
      await expect(op).resolves.toEqual({ status: "finished" });
      // The operation is settled, so a later show is a fresh no-replay result.
      const settled = handle.show();
      expect(settled).not.toBe(op);
      await expect(settled).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("settles finished and drops boil when reduced motion activates during the reveal", async () => {
      vi.useFakeTimers();
      const media = reducedMotion(false);
      vi.stubGlobal("matchMedia", () => media);
      const handle = attach(element(), {
        seed: 1,
        animate: true,
        animationDuration: 400,
        boil: 0.4,
      });
      expect(drawn()).toHaveLength(3);
      const op = handle.show();
      vi.advanceTimersByTime(100);
      expect(Number(offset())).toBeLessThan(1);
      media.set(true);
      expect(offset()).toBeNull();
      // Reduced motion renders one static variant and touches no reveal attributes.
      expect(drawn()).toHaveLength(1);
      expect(drawn()[0].getAttribute("class")).not.toContain("stet-boil");
      await expect(op).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("hover resketch redraws at current progress and keeps the operation deadline", async () => {
      vi.useFakeTimers();
      const node = element();
      const handle = attach(node, {
        seed: 1,
        animate: true,
        animationDuration: 600,
        boil: 0.3,
        resketchOnHover: true,
      });
      const op = handle.show();
      vi.advanceTimersByTime(300);
      const before = Number(offset());
      const beforeD = first().getAttribute("d");
      expect(before).toBeGreaterThan(0);
      expect(before).toBeLessThan(1);
      node.dispatchEvent(new PointerEvent("pointerenter"));
      // The operation is untouched: same promise, and progress never jumps back.
      expect(handle.show()).toBe(op);
      expect(Number(offset())).toBeLessThanOrEqual(before);
      expect(first().getAttribute("d")).not.toBe(beforeD);
      // Only the remaining time is needed to settle, so the deadline is unchanged.
      vi.advanceTimersByTime(310);
      expect(offset()).toBeNull();
      await expect(op).resolves.toEqual({ status: "finished" });
      handle.destroy();
    });

    it("keeps every boil variant hidden at frame zero and clear at the final frame", () => {
      vi.useFakeTimers();
      const handle = attach(element(), {
        seed: 1,
        animate: true,
        animationDuration: 300,
        boil: 0.5,
      });
      const variants = drawn();
      expect(variants).toHaveLength(3);
      for (const variant of variants) {
        expect(variant.getAttribute("class")).toContain("stet-boil");
        expect(variant.getAttribute("pathLength")).toBe("1");
        expect(variant.getAttribute("stroke-dasharray")).toBe("1");
        expect(variant.getAttribute("stroke-dashoffset")).toBe("1");
        expect(variant.hasAttribute("opacity")).toBe(false);
      }
      vi.advanceTimersByTime(400);
      for (const variant of variants) {
        expect(variant.getAttribute("pathLength")).toBeNull();
        expect(variant.getAttribute("stroke-dasharray")).toBeNull();
        expect(variant.getAttribute("stroke-dashoffset")).toBeNull();
        expect(variant.hasAttribute("opacity")).toBe(false);
      }
      handle.destroy();
    });

    it("reduced motion yields one stable variant and disables hover resketch", () => {
      vi.useFakeTimers();
      const media = reducedMotion(true);
      vi.stubGlobal("matchMedia", () => media);
      const node = element();
      const handle = attach(node, { seed: 1, boil: 0.5, resketchOnHover: true });
      expect(drawn()).toHaveLength(1);
      expect(drawn()[0].getAttribute("class")).not.toContain("stet-boil");
      const stable = paths();
      node.dispatchEvent(new PointerEvent("pointerenter"));
      expect(drawn()).toHaveLength(1);
      expect(paths()).toEqual(stable);
      // A repeat refresh is still the same stable single variant for capture.
      handle.refresh();
      expect(paths()).toEqual(stable);
      handle.destroy();
    });

    it("settles an offscreen operation finished when reduced motion activates while culled", async () => {
      vi.useFakeTimers();
      const node = element(20, 1400);
      const media = reducedMotion(false);
      vi.stubGlobal("matchMedia", () => media);
      const handle = attach(node, { seed: 1, animate: true, animationDuration: 600 });
      expect(overlay().hidden).toBe(true);
      const op = handle.show();
      vi.advanceTimersByTime(200);
      media.set(true);
      await expect(op).resolves.toEqual({ status: "finished" });
      expect(offset()).toBeNull();
      // Reconnecting shows the final frame rather than replaying.
      const onscreen = new DOMRect(10, 20, 100, 30);
      vi.mocked(node.getBoundingClientRect).mockReturnValue(onscreen);
      vi.mocked(node.getClientRects).mockReturnValue([onscreen] as unknown as DOMRectList);
      handle.refresh();
      expect(overlay().hidden).toBe(false);
      expect(offset()).toBeNull();
      handle.destroy();
    });
  },
);

// CORE-07: adapters update supported runtime data through the source-only
// nonreplaying path. Every field must apply in place without touching the
// current operation, the current seed, or explicit visibility.
describe("updateHandle", () => {
  const names = ["box", "circle", "underline", "highlight", "mark", "sticky", "arrow"] as const;
  type Name = (typeof names)[number];
  const overlay = () => document.querySelector<HTMLElement>(".stet-overlay")!;
  const path = () => document.querySelector<SVGPathElement>(".stet-svg path")!;
  const offset = () => path().getAttribute("stroke-dashoffset");

  const baseOptions = (name: Name): Record<string, unknown> =>
    name === "mark"
      ? { seed: 1, kind: "right" }
      : name === "sticky"
        ? { seed: 1, text: "Note" }
        : name === "arrow"
          ? { seed: 1, label: "Note" }
          : { seed: 1 };

  function attachHandle(name: Name, node: Element, to: Element): StetHandle {
    switch (name) {
      case "box":
        return box(node, { seed: 1 });
      case "circle":
        return circle(node, { seed: 1 });
      case "underline":
        return underline(node, { seed: 1 });
      case "highlight":
        return highlight(node, { seed: 1 });
      case "mark":
        return mark(node, "right", { seed: 1 });
      case "sticky":
        return sticky(node, { seed: 1, text: "Note" });
      case "arrow":
        return arrow(node, to, { seed: 1, label: "Note" });
    }
  }

  it("rejects handles not created by stet", () => {
    expect(() => updateHandle({} as StetHandle, { seed: 1 })).toThrow("created by stet");
  });

  it("no-ops when the snapshot has the same values", () => {
    const node = element(10, 20);
    const handle = circle(node, { seed: 1, description: "A" });
    const left = overlay().style.left;
    const shifted = new DOMRect(500, 500, 100, 30);
    vi.mocked(node.getBoundingClientRect).mockReturnValue(shifted);
    vi.mocked(node.getClientRects).mockReturnValue([shifted] as unknown as DOMRectList);
    updateHandle(handle, { seed: 1, description: "A" });
    // An identical snapshot must not redraw, so the stale geometry stands.
    expect(overlay().style.left).toBe(left);
    // A changed value does redraw against the new geometry.
    updateHandle(handle, { seed: 1, description: "B" });
    expect(overlay().style.left).toBe("495px");
    handle.destroy();
  });

  it("returns removed values to defaults", () => {
    const node = element();
    const handle = circle(node, {
      seed: 1,
      padding: 20,
      description: "A",
      stroke: "red",
      fill: "blue",
    });
    expect(parseFloat(overlay().style.width)).toBe(140);
    expect(document.querySelector(".stet-description")).not.toBeNull();
    updateHandle(handle, { seed: 1 });
    expect(parseFloat(overlay().style.width)).toBe(110);
    expect(document.querySelector(".stet-description")).toBeNull();
    expect(overlay().style.getPropertyValue("--stet-ink")).toBe("");
    expect(overlay().style.getPropertyValue("--stet-local-fill")).toBe("");
    handle.destroy();
  });

  it.each(names)("updates stroke, fill, and width for %s", (name) => {
    const node = element();
    const to = element(300, 100);
    const handle = attachHandle(name, node, to);
    updateHandle(handle, {
      ...baseOptions(name),
      stroke: "rgb(1, 2, 3)",
      fill: "rgb(4, 5, 6)",
      width: 7,
    });
    const style = overlay().style;
    expect(style.getPropertyValue("--stet-ink")).toBe("rgb(1, 2, 3)");
    expect(style.getPropertyValue("--stet-local-fill")).toBe("rgb(4, 5, 6)");
    expect(style.getPropertyValue("--stet-width")).toBe("7");
    handle.destroy();
  });

  it.each(names)("redraws on seed and roughness changes for %s", (name) => {
    const node = element();
    const to = element(300, 100);
    const handle = attachHandle(name, node, to);
    const initial = paths();
    updateHandle(handle, { ...baseOptions(name), roughness: 0.25 });
    const rougher = paths();
    expect(rougher).not.toEqual(initial);
    updateHandle(handle, { ...baseOptions(name), seed: 9 });
    expect(paths()).not.toEqual(rougher);
    handle.destroy();
  });

  it.each(names)("adds and removes boil variants for %s", (name) => {
    const node = element();
    const to = element(300, 100);
    const handle = attachHandle(name, node, to);
    const before = paths().length;
    updateHandle(handle, { ...baseOptions(name), boil: 0.4 });
    expect(paths().length).toBeGreaterThan(before);
    updateHandle(handle, { ...baseOptions(name), boil: 0 });
    expect(paths().length).toBe(before);
    handle.destroy();
  });

  it.each(["box", "circle", "underline", "highlight", "mark"] as const)(
    "updates padding for %s",
    (name) => {
      const node = element();
      const handle = attachHandle(name, node, node);
      const before = parseFloat(overlay().style.width);
      updateHandle(handle, { ...baseOptions(name), padding: 30 });
      expect(parseFloat(overlay().style.width)).toBeGreaterThan(before);
      updateHandle(handle, { ...baseOptions(name) });
      expect(parseFloat(overlay().style.width)).toBe(before);
      handle.destroy();
    },
  );

  it.each(names)("adds and removes descriptions for %s while preserving foreign IDs", (name) => {
    const node = element();
    const to = element(300, 100);
    node.setAttribute("aria-describedby", "native");
    const handle = attachHandle(name, node, to);
    const target = name === "arrow" ? to : node;
    const owned = (el: Element) =>
      el.getAttribute("aria-describedby")?.match(/stet-description-/g)?.length ?? 0;
    target.setAttribute("aria-describedby", "native");
    updateHandle(handle, { ...baseOptions(name), description: "Described" });
    const withDescription = owned(target);
    expect(withDescription).toBeGreaterThan(0);
    expect(document.querySelector(".stet-description")?.textContent).toBe("Described");
    expect(target.getAttribute("aria-describedby")).toContain("native");
    updateHandle(handle, { ...baseOptions(name) });
    expect(owned(target)).toBe(withDescription - 1);
    expect(target.getAttribute("aria-describedby")).toContain("native");
    handle.destroy();
  });

  it.each(names)("toggles hover resketch listeners for %s", (name) => {
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const node = element();
    const to = element(300, 100);
    const handle = attachHandle(name, node, to);
    const before = paths();
    updateHandle(handle, { ...baseOptions(name), resketchOnHover: true });
    node.dispatchEvent(new PointerEvent("pointerenter"));
    const resketched = paths();
    expect(resketched).not.toEqual(before);
    updateHandle(handle, { ...baseOptions(name), resketchOnHover: false });
    node.dispatchEvent(new PointerEvent("pointerenter"));
    expect(paths()).toEqual(resketched);
    handle.destroy();
  });

  it("adds, changes, and removes a description while preserving foreign IDs", () => {
    const node = element();
    node.setAttribute("aria-describedby", "native");
    const handle = circle(node, { seed: 1 });
    updateHandle(handle, { seed: 1, description: "One" });
    const linked = node.getAttribute("aria-describedby")!;
    expect(linked.startsWith("native ")).toBe(true);
    updateHandle(handle, { seed: 1, description: "Two" });
    expect(node.getAttribute("aria-describedby")).toBe(linked);
    expect(document.querySelector(".stet-description")?.textContent).toBe("Two");
    updateHandle(handle, { seed: 1 });
    expect(node.getAttribute("aria-describedby")).toBe("native");
    handle.destroy();
  });

  it("preserves explicit hidden state and ARIA safety across description updates", async () => {
    const node = element();
    node.setAttribute("aria-describedby", "native");
    const handle = circle(node, { seed: 1, visible: false, description: "Old" });
    expect(overlay().hidden).toBe(true);
    updateHandle(handle, { seed: 1, description: "New" });
    expect(overlay().hidden).toBe(true);
    expect(node.getAttribute("aria-describedby")).toBe("native");
    expect(document.querySelector(".stet-description")?.textContent).toBe("New");
    await expect(handle.show()).resolves.toEqual({ status: "finished" });
    expect(overlay().hidden).toBe(false);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    expect(document.querySelector(".stet-description")?.textContent).toBe("New");
    handle.hide();
    updateHandle(handle, { seed: 1 });
    await expect(handle.show()).resolves.toEqual({ status: "finished" });
    expect(node.getAttribute("aria-describedby")).toBe("native");
    handle.destroy();
  });

  it("ignores visible through the internal update path", () => {
    const node = element();
    const visible = circle(node, { seed: 1 });
    updateHandle(visible, { seed: 1, visible: false });
    expect(overlay().hidden).toBe(false);
    visible.destroy();
    document.body.replaceChildren();

    const hiddenNode = element();
    const hidden = circle(hiddenNode, { seed: 1, visible: false });
    updateHandle(hidden, { seed: 1, visible: true });
    expect(overlay().hidden).toBe(true);
    hidden.destroy();
  });

  it("preserves the current operation promise, progress, and deadline", async () => {
    vi.useFakeTimers();
    const handle = circle(element(), { seed: 1, animate: true, animationDuration: 600 });
    const op = handle.show();
    vi.advanceTimersByTime(300);
    const before = Number(offset());
    updateHandle(handle, { seed: 1, stroke: "red" });
    expect(handle.show()).toBe(op);
    expect(Number(offset())).toBeLessThanOrEqual(before);
    expect(overlay().style.getPropertyValue("--stet-ink")).toBe("red");
    vi.advanceTimersByTime(310);
    await expect(op).resolves.toEqual({ status: "finished" });
    handle.destroy();
  });

  it("redraws at current progress on a seed change without restarting the operation", async () => {
    vi.useFakeTimers();
    const handle = circle(element(), { seed: 1, animate: true, animationDuration: 600 });
    const op = handle.show();
    vi.advanceTimersByTime(300);
    const before = Number(offset());
    const beforeD = path().getAttribute("d");
    updateHandle(handle, { seed: 2 });
    expect(path().getAttribute("d")).not.toBe(beforeD);
    expect(Number(offset())).toBeLessThanOrEqual(before);
    vi.advanceTimersByTime(310);
    await expect(op).resolves.toEqual({ status: "finished" });
    handle.destroy();
  });

  it("keeps the resketched seed when the seed option is unchanged", () => {
    const handle = circle(element(), { seed: 1 });
    handle.resketch(99);
    const resketched = paths();
    updateHandle(handle, { seed: 1, stroke: "red" });
    expect(paths()).toEqual(resketched);
    handle.destroy();
  });

  it("applies animation updates to the next entrance only", async () => {
    vi.useFakeTimers();
    const handle = circle(element(), { seed: 1, animate: true, animationDuration: 600 });
    const op = handle.show();
    vi.advanceTimersByTime(200);
    updateHandle(handle, { seed: 1, animate: true, animationDuration: 100, animationDelay: 0 });
    // The current operation keeps its original 600 ms deadline.
    vi.advanceTimersByTime(100);
    expect(offset()).not.toBeNull();
    await vi.advanceTimersByTimeAsync(400);
    await expect(op).resolves.toEqual({ status: "finished" });
    // The next entrance uses the updated duration.
    const replay = handle.replay();
    vi.advanceTimersByTime(100);
    await expect(replay).resolves.toEqual({ status: "finished" });
    handle.destroy();
  });

  it("updates mark kind and rejects invalid kinds before mutation", () => {
    const node = element();
    const handle = mark(node, "right", { seed: 1 });
    expect(document.querySelector(".stet-mark--right")).not.toBeNull();
    updateHandle(handle, { seed: 1, kind: "wrong" });
    expect(document.querySelector(".stet-mark--wrong")).not.toBeNull();
    expect(document.querySelector(".stet-mark--right")).toBeNull();
    const before = paths();
    expect(() => updateHandle(handle, { seed: 1, kind: "maybe" })).toThrow("mark kind");
    expect(paths()).toEqual(before);
    handle.destroy();
  });

  it("updates arrow label, curvature, and offsets and removes label ARIA safely", async () => {
    const from = element();
    const to = element(300, 100);
    to.setAttribute("aria-describedby", "native");
    const handle = arrow(from, to, { seed: 1 });
    expect(document.querySelector(".stet-label")).toBeNull();
    const beforePath = paths()[0];
    updateHandle(handle, { seed: 1, label: "Two", curvature: 0.4 });
    expect(document.querySelector(".stet-label")?.textContent).toBe("Two");
    expect(paths()[0]).not.toBe(beforePath);
    expect(to.getAttribute("aria-describedby")).toContain("stet-description-");
    const label = document.querySelector<HTMLElement>(".stet-label")!;
    const baseline = [parseFloat(label.style.left), parseFloat(label.style.top)];
    updateHandle(handle, {
      seed: 1,
      label: "Two",
      curvature: 0.4,
      labelOffsetX: 5,
      labelOffsetY: 6,
    });
    expect([parseFloat(label.style.left), parseFloat(label.style.top)]).toEqual([
      baseline[0] + 5,
      baseline[1] + 6,
    ]);
    updateHandle(handle, { seed: 1, curvature: 0.4 });
    expect(document.querySelector(".stet-label")).toBeNull();
    expect(to.getAttribute("aria-describedby")).toBe("native");
    // A later hide/show must not resurrect the removed relationship.
    handle.hide();
    await expect(handle.show()).resolves.toEqual({ status: "finished" });
    expect(to.getAttribute("aria-describedby")).toBe("native");
    handle.destroy();
  });

  it("updates sticky text, side, and offsets", () => {
    const node = element(300, 300, 100, 30);
    node.setAttribute("aria-describedby", "native");
    const handle = sticky(node, { text: "One", side: "right", seed: 1 });
    expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("One");
    const baseline = parseFloat(overlay().style.left);
    const baselineTop = parseFloat(overlay().style.top);
    updateHandle(handle, { text: "Two", side: "right", seed: 1, offsetX: 25, offsetY: -20 });
    expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
    expect(parseFloat(overlay().style.left)).toBe(baseline + 25);
    expect(parseFloat(overlay().style.top)).toBe(baselineTop - 20);
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    updateHandle(handle, { text: "Two", side: "top", seed: 1 });
    expect(parseFloat(overlay().style.top)).toBeLessThan(300);
    handle.destroy();
  });

  it("updates arrow and sticky text while explicitly hidden without exposing ARIA", async () => {
    const from = element();
    const to = element(300, 100);
    const arrowHandle = arrow(from, to, { seed: 1, visible: false });
    updateHandle(arrowHandle, { seed: 1, label: "Hidden label" });
    expect(document.querySelector(".stet-label")?.textContent).toBe("Hidden label");
    expect(to.hasAttribute("aria-describedby")).toBe(false);
    await arrowHandle.show();
    expect(to.getAttribute("aria-describedby")).toContain("stet-description-");
    arrowHandle.destroy();
    document.body.replaceChildren();

    const node = element();
    const stickyHandle = sticky(node, { seed: 1, text: "One", visible: false });
    updateHandle(stickyHandle, { seed: 1, text: "Two" });
    expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
    expect(node.hasAttribute("aria-describedby")).toBe(false);
    await stickyHandle.show();
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    stickyHandle.destroy();
  });

  it("updates owned text while culled without treating culling as explicit hide", () => {
    const from = element(20, 1800);
    const to = element(300, 2000);
    to.setAttribute("aria-describedby", "native");
    const arrowHandle = arrow(from, to, { seed: 1 });
    expect(overlay().hidden).toBe(true);
    updateHandle(arrowHandle, { seed: 1, label: "Offscreen label" });
    expect(overlay().hidden).toBe(true);
    expect(document.querySelector(".stet-label")?.textContent).toBe("Offscreen label");
    expect(to.getAttribute("aria-describedby")).toContain("stet-description-");
    updateHandle(arrowHandle, { seed: 1 });
    expect(to.getAttribute("aria-describedby")).toBe("native");
    arrowHandle.destroy();
    document.body.replaceChildren();

    const node = element(20, 2000);
    const stickyHandle = sticky(node, { seed: 1, text: "One" });
    updateHandle(stickyHandle, { seed: 1, text: "Two" });
    expect(overlay().hidden).toBe(true);
    expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
    expect(node.getAttribute("aria-describedby")).toContain("stet-description-");
    stickyHandle.destroy();
  });

  it("validates timing, support, and required text before mutating", () => {
    const node = element();
    node.setAttribute("aria-describedby", "native");
    const handle = circle(node, { seed: 1, description: "Keep" });
    const before = {
      paths: paths(),
      aria: node.getAttribute("aria-describedby"),
      left: overlay().style.left,
    };
    expect(() => updateHandle(handle, { seed: 2, animationDuration: -1 })).toThrow(RangeError);
    expect(paths()).toEqual(before.paths);
    expect(node.getAttribute("aria-describedby")).toBe(before.aria);
    expect(overlay().style.left).toBe(before.left);
    handle.destroy();
    document.body.replaceChildren();

    const highlightHandle = highlight(element(), { seed: 1 });
    expect(() => updateHandle(highlightHandle, { seed: 1, animate: true })).toThrow(TypeError);
    highlightHandle.destroy();
    document.body.replaceChildren();

    const stickyHandle = sticky(element(), { text: "Note", seed: 1 });
    expect(() => updateHandle(stickyHandle, { seed: 1 })).toThrow("sticky text");
    stickyHandle.destroy();
  });

  it("no-ops on destroyed handles", () => {
    const handle = circle(element(), { seed: 1 });
    handle.destroy();
    expect(() => updateHandle(handle, { seed: 2 })).not.toThrow();
  });

  it("keeps update off public handles and root exports", () => {
    expect("updateHandle" in stet).toBe(false);
    expect("update" in stet).toBe(false);
    const node = element();
    const to = element(300, 100);
    for (const name of names) {
      const handle = attachHandle(name, node, to);
      expect("update" in handle).toBe(false);
      expect(Object.keys(handle)).not.toContain("update");
      expect(typeof (handle as unknown as Record<string, unknown>).update).toBe("undefined");
      handle.destroy();
    }
  });
});
