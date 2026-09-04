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
    const handle = circle(node);
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
});
