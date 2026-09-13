import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { arrow, circle, mark, sticky } from "../src/svelte.js";
import type { StetHandle } from "../src/index.js";

type Callback = (handle: StetHandle | null) => void;

/**
 * happy-dom returns zero-sized rects, which the runtime treats as culled. Pin a
 * fixed onscreen box so overlay `hidden` reflects explicit visibility, not
 * geometry.
 */
const RECT = new DOMRect(10, 20, 100, 30);

beforeEach(() => {
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([RECT] as unknown as DOMRectList);
});

afterEach(() => {
  document.body.textContent = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function collector(): { calls: (StetHandle | null)[]; onHandle: Callback } {
  const calls: (StetHandle | null)[] = [];
  return { calls, onHandle: (handle) => calls.push(handle) };
}

function host(): HTMLButtonElement {
  const element = document.createElement("button");
  document.body.append(element);
  return element;
}

function overlay(): HTMLElement {
  return document.querySelector<HTMLElement>(".stet-overlay")!;
}

function ink(): string {
  return overlay().style.getPropertyValue("--stet-ink");
}

it("keeps an action mounted when option values do not change", () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const element = document.createElement("div");
  document.body.append(element);
  const action = circle(element, { seed: 1 });
  const overlay = document.querySelector(".stet-overlay");
  action.update({ seed: 1 });
  expect(document.querySelector(".stet-overlay")).toBe(overlay);
  action.destroy();
});

it("observes an options object edited in place", () => {
  const element = document.createElement("button");
  document.body.append(element);
  const options = { seed: 1, stroke: "red" };
  const action = circle(element, options);
  options.stroke = "blue";
  action.update(options);
  expect(
    document.querySelector<HTMLElement>(".stet-overlay")?.style.getPropertyValue("--stet-ink"),
  ).toBe("blue");
  action.destroy();
});

it("allows simple actions without an options argument", () => {
  const element = document.createElement("button");
  document.body.append(element);
  const action = circle(element);
  expect(document.querySelector(".stet-overlay--circle")).not.toBeNull();
  action.destroy();
});

it("delivers the handle after attachment and null on destroy", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const action = circle(element, { seed: 1, onHandle });

  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();

  action.destroy();
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("transfers a live handle to a new callback without remount, update, or replay", () => {
  const a = collector();
  const b = collector();
  const element = host();
  const action = circle(element, { seed: 1, onHandle: a.onHandle });

  const handle = a.calls[0]!;
  const mounted = overlay();
  const replay = vi.spyOn(handle, "replay");
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");
  const destroy = vi.spyOn(handle, "destroy");

  action.update({ seed: 1, onHandle: b.onHandle });
  expect(a.calls).toEqual([handle, null]);
  expect(b.calls).toEqual([handle]);
  expect(overlay()).toBe(mounted);
  expect(replay).not.toHaveBeenCalled();
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  // The new owner, not the old one, receives the teardown null.
  action.destroy();
  expect(b.calls).toEqual([handle, null]);
});

it("still delivers the existing handle when the outgoing callback throws", () => {
  const seen: (StetHandle | null)[] = [];
  const oldCallback: Callback = (handle) => {
    if (handle === null) throw new Error("old callback failed");
    seen.push(handle);
  };
  const next = collector();
  const element = host();
  const action = circle(element, { seed: 1, onHandle: oldCallback });
  const handle = seen[0]!;

  // The outgoing failure must not stop the new owner from receiving the handle.
  expect(() => action.update({ seed: 1, onHandle: next.onHandle })).toThrow("old callback failed");
  expect(next.calls).toEqual([handle]);

  action.destroy();
  expect(next.calls).toEqual([handle, null]);
});

it("applies a changed visible value once and preserves imperative state", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const base = { seed: 1, onHandle };
  const action = circle(element, { ...base, visible: false, stroke: "red" });

  expect(overlay().hidden).toBe(true);
  const handle = calls[0]!;
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");

  // An unrelated update while hidden must not call show or hide.
  action.update({ ...base, visible: false, stroke: "blue" });
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();
  expect(overlay().hidden).toBe(true);

  action.update({ ...base, visible: true, stroke: "blue" });
  expect(show).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(false);

  handle.hide();
  expect(hide).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(true);

  // An unrelated update must not overwrite the imperative hide.
  const showBefore = show.mock.calls.length;
  action.update({ ...base, visible: true, stroke: "green" });
  expect(hide).toHaveBeenCalledTimes(1);
  expect(show).toHaveBeenCalledTimes(showBefore);
  expect(overlay().hidden).toBe(true);

  action.update({ ...base, visible: false, stroke: "green" });
  expect(hide).toHaveBeenCalledTimes(2);

  // Explicit false -> omitted is a change to the default true.
  action.update({ ...base, visible: undefined, stroke: "green" });
  expect(show).toHaveBeenCalledTimes(2);
  expect(overlay().hidden).toBe(false);

  action.destroy();
});

it("updates non-visible options in place through updateHandle without remount or replay", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const action = circle(element, { seed: 1, stroke: "red", onHandle });

  const handle = calls[0]!;
  const mounted = overlay();
  const drawing = document.querySelector(".stet-svg path")!.getAttribute("d");

  action.update({ seed: 1, stroke: "blue", description: "Explained", onHandle });
  expect(calls).toEqual([handle]);
  expect(overlay()).toBe(mounted);
  expect(ink()).toBe("blue");
  expect(document.querySelector(".stet-description")?.textContent).toBe("Explained");
  expect(document.querySelector(".stet-svg path")!.getAttribute("d")).toBe(drawing);
  expect(element.getAttribute("aria-describedby")).toContain("stet-description-");

  action.destroy();
});

it("sends a complete snapshot so removed values return to defaults", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const action = circle(element, { seed: 1, padding: 20, description: "A", onHandle });

  const handle = calls[0]!;
  const wide = parseFloat(overlay().style.width);
  expect(document.querySelector(".stet-description")).not.toBeNull();

  action.update({ seed: 1, padding: undefined, description: undefined, onHandle });
  expect(parseFloat(overlay().style.width)).toBeLessThan(wide);
  expect(document.querySelector(".stet-description")).toBeNull();
  expect(calls).toEqual([handle]);

  action.destroy();
});

it("waits silently for an absent Arrow destination and reports null when it disappears", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const destination = document.createElement("p");
  document.body.append(destination);
  const action = arrow(element, { to: undefined, seed: 1, onHandle });

  // No attach and no null notification while the destination is absent.
  expect(calls).toHaveLength(0);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  action.update({ to: destination, seed: 1, onHandle });
  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();

  action.update({ to: null, seed: 1, onHandle });
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  // A reappearing destination attaches a fresh handle.
  action.update({ to: destination, seed: 1, onHandle });
  expect(calls).toHaveLength(3);
  expect(calls[2]).not.toBe(handle);

  action.destroy();
});

it("replaces the handle when Arrow's destination changes and moves owned ARIA", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const first = document.createElement("p");
  const second = document.createElement("p");
  document.body.append(first, second);
  const action = arrow(element, { to: first, seed: 1, label: "One", onHandle });

  const handle = calls[0]!;
  const firstOverlay = overlay();
  expect(document.querySelector(".stet-label")?.textContent).toBe("One");
  expect(first.getAttribute("aria-describedby")).toContain("stet-description-");

  // A label change updates in place; the handle is not recreated.
  action.update({ to: first, seed: 1, label: "Two", onHandle });
  expect(document.querySelector(".stet-label")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);

  action.update({ to: second, seed: 1, label: "Two", onHandle });
  expect(calls[0]).toBe(handle);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(handle);
  expect(calls).toHaveLength(3);
  // The old overlay and its owned ARIA relationship are torn down; the
  // replacement attaches to the new destination.
  expect(overlay()).not.toBe(firstOverlay);
  expect(first.hasAttribute("aria-describedby")).toBe(false);
  expect(second.getAttribute("aria-describedby")).toContain("stet-description-");

  action.destroy();
});

it("attaches the Arrow replacement even when the outgoing owner throws on null", () => {
  const seen: StetHandle[] = [];
  const outgoing: Callback = (handle) => {
    if (handle === null) throw new Error("outgoing failed");
    seen.push(handle);
  };
  const next = collector();
  const element = host();
  const first = document.createElement("p");
  const second = document.createElement("p");
  document.body.append(first, second);
  const action = arrow(element, { to: first, seed: 1, label: "L", onHandle: outgoing });
  const handle = seen[0]!;
  const firstOverlay = overlay();

  // The outgoing exception is surfaced, not swallowed...
  expect(() => action.update({ to: second, seed: 1, label: "L", onHandle: next.onHandle })).toThrow(
    "outgoing failed",
  );
  expect(seen).toEqual([handle]);
  // ...and the valid replacement still attached and reached the new owner.
  expect(next.calls).toHaveLength(1);
  const replacement = next.calls[0]!;
  expect(replacement).not.toBe(handle);
  expect(overlay()).not.toBe(firstOverlay);
  expect(first.hasAttribute("aria-describedby")).toBe(false);

  // The new owner receives the teardown null.
  action.destroy();
  expect(next.calls).toEqual([replacement, null]);
});

it("updates mark kind in place without remount", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const action = mark(element, { kind: "right", seed: 1, onHandle });

  const handle = calls[0]!;
  expect(document.querySelector(".stet-mark--right")).not.toBeNull();

  action.update({ kind: "wrong", seed: 1, onHandle });
  expect(document.querySelector(".stet-mark--wrong")).not.toBeNull();
  expect(document.querySelector(".stet-mark--right")).toBeNull();
  expect(calls).toEqual([handle]);

  action.destroy();
});

it("updates sticky text in place without remount", () => {
  const { calls, onHandle } = collector();
  const element = host();
  const action = sticky(element, { text: "One", seed: 1, onHandle });

  const handle = calls[0]!;
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("One");

  action.update({ text: "Two", seed: 1, onHandle });
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);

  action.destroy();
});
