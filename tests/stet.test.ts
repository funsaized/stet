import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  arrow,
  circle,
  highlight,
  mark,
  sticky,
  underline,
  type StetHandle,
} from "../src/index.js";

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

// Compare advertised defaults to observable runtime output, not renderer source text.
it("agent capability defaults reproduce omitted runtime defaults", () => {
  const caps = JSON.parse(readFileSync("agent/capabilities.json", "utf8"));
  const from = element(), to = element(320, 100);
  for (const [name, meta] of Object.entries<any>(caps.primitives)) {
    const required = name === "sticky" ? { text: "Review first." } : name === "arrow" ? { label: "Destination" } : {};
    const defaults = Object.fromEntries(Object.entries(meta.defaults).filter(([,v]) => typeof v === "number" || typeof v === "boolean" || v === "auto"));
    const attach = (options: any) => name === "mark" ? mark(from, "wrong", options) : name === "arrow" ? arrow(from, to, options) : ({ circle, underline, highlight, sticky } as any)[name](from, options);
    const implicit = attach({ ...required, seed: 42 });
    const snapshot = () => ({ paths: paths(), position: document.querySelector<HTMLElement>(".stet-overlay")!.style.cssText });
    const expected = snapshot();
    from.dispatchEvent(new Event("pointerenter"));
    expect(snapshot()).toEqual(expected);
    implicit.destroy();
    const explicit = attach({ ...required, ...defaults, seed: 42 });
    expect(snapshot()).toEqual(expected);
    explicit.destroy();
  }
});

it('nudges notes after side selection and clamps them to the viewport', () => {
  const node = element(300, 300, 100, 30);
  let handle = sticky(node, { text: 'Evidence', side: 'right', seed: 2 });
  const read = () => { const style = document.querySelector<HTMLElement>('.stet-overlay--sticky')!.style; return [parseFloat(style.left), parseFloat(style.top)]; };
  const baseline = read(); handle.destroy();
  handle = sticky(node, { text: 'Evidence', side: 'right', seed: 2, offsetX: 25, offsetY: -20 });
  expect(read()).toEqual([baseline[0] + 25, baseline[1] - 20]);
  handle.refresh(); expect(read()).toEqual([baseline[0] + 25, baseline[1] - 20]);
  handle.destroy();
  handle = sticky(node, { text: 'Evidence', offsetX: -10000, offsetY: -10000 });
  expect(read()).toEqual([12, 12]); handle.destroy();
});

it('moves an arrow label independently of its path and retains viewport clamping', () => {
  const from = element(300, 300), to = element(600, 400);
  const read = () => { const style = document.querySelector<HTMLElement>('.stet-label')!.style; return [parseFloat(style.left), parseFloat(style.top)]; };
  let handle = arrow(from, to, { label: 'Review', seed: 2 });
  const baseline = read(), path = paths(); handle.destroy();
  handle = arrow(from, to, { label: 'Review', seed: 2, labelOffsetX: -25, labelOffsetY: 20 });
  expect(read()).toEqual([baseline[0] - 25, baseline[1] + 20]); expect(paths()).toEqual(path);
  handle.refresh(); expect(read()).toEqual([baseline[0] - 25, baseline[1] + 20]); handle.destroy();
  handle = arrow(from, to, { label: 'Review', labelOffsetX: -10000, labelOffsetY: -10000 });
  const label = document.querySelector<HTMLElement>('.stet-label')!;
  const root = label.parentElement!;
  expect(parseFloat(root.style.left) + parseFloat(label.style.left)).toBe(8);
  expect(parseFloat(root.style.top) + parseFloat(label.style.top)).toBe(8);
  handle.destroy();
});
