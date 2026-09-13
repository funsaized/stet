import { Fragment, StrictMode, act, createElement, createRef, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Arrow, Circle, Mark, Sticky } from "../src/react.js";
import type { StetHandle } from "../src/index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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

function overlay(): HTMLElement {
  return document.querySelector<HTMLElement>(".stet-overlay")!;
}

function ink(): string {
  return overlay().style.getPropertyValue("--stet-ink");
}

async function render(element: ReactElement): Promise<Root> {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(() => root.render(element));
  return root;
}

it("handles Strict Mode, ref reassignment, unchanged props, and unmount", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLElement>();
  const app = (tag: string, stroke = "red") =>
    createElement(
      StrictMode,
      null,
      createElement(tag, { ref }, "Save"),
      createElement(Circle, { target: ref, seed: 7, stroke, description: "Important" }),
    );
  await act(() => root.render(app("button")));
  expect(document.querySelectorAll(".stet-overlay")).toHaveLength(1);
  const overlay = document.querySelector(".stet-overlay");
  await act(() => root.render(app("button")));
  expect(document.querySelector(".stet-overlay")).toBe(overlay);
  const previousTarget = ref.current!;
  await act(() => root.render(app("a")));
  expect(document.querySelectorAll(".stet-overlay")).toHaveLength(1);
  expect(document.querySelector(".stet-overlay")).not.toBe(overlay);
  expect(previousTarget.hasAttribute("aria-describedby")).toBe(false);
  expect(ref.current?.getAttribute("aria-describedby")).toContain("stet-description-");
  await act(() => root.render(app("a", "blue")));
  expect(
    document.querySelector<HTMLElement>(".stet-overlay")?.style.getPropertyValue("--stet-ink"),
  ).toBe("blue");
  await act(() => root.unmount());
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("forwards arrow curvature, label updates, and null refs", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const from = createRef<HTMLButtonElement>(),
    to = createRef<HTMLButtonElement>();
  const app = (visible: boolean, label: string) =>
    createElement(
      "div",
      null,
      createElement("button", { ref: from }, "From"),
      visible && createElement("button", { ref: to }, "To"),
      createElement(Arrow, { from, to, label, curvature: -0.3, seed: 4 }),
    );
  await act(() => root.render(app(true, "First")));
  expect(document.querySelector(".stet-label")?.textContent).toBe("First");
  const target = to.current!;
  await act(() => root.render(app(true, "Second")));
  expect(document.querySelector(".stet-label")?.textContent).toBe("Second");
  expect(target.getAttribute("aria-describedby")?.split(" ")).toHaveLength(1);
  await act(() => root.render(app(false, "Gone")));
  expect(document.querySelector(".stet-overlay")).toBeNull();
  expect(target.hasAttribute("aria-describedby")).toBe(false);
  await act(() => root.unmount());
});

it("delivers the handle after attachment and null on unmount", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const root = await render(
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, onHandle }),
    ),
  );
  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();
  await act(() => root.unmount());
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("StrictMode destroys then nulls the old handle before re-attaching", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const root = await render(
    createElement(
      StrictMode,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, onHandle }),
    ),
  );
  // StrictMode runs setup, cleanup, setup: handle, null, handle.
  expect(calls.map((handle) => (handle ? "handle" : "null"))).toEqual(["handle", "null", "handle"]);
  expect(calls[0]).not.toBe(calls[2]);
  await act(() => root.unmount());
  expect(calls.map((handle) => (handle ? "handle" : "null"))).toEqual([
    "handle",
    "null",
    "handle",
    "null",
  ]);
  expect(calls[3]).toBeNull();
});

it("applies a changed visible prop once and preserves imperative state", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (visible?: boolean) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, visible, onHandle }),
    );
  const root = await render(app(false));
  expect(overlay().hidden).toBe(true);
  const handle = calls[0]!;
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");

  await act(() => root.render(app(false)));
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();

  await act(() => root.render(app(true)));
  expect(show).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(false);

  handle.hide();
  expect(hide).toHaveBeenCalledTimes(1);

  // An unrelated render must not overwrite the imperative hide.
  await act(() => root.render(app(true)));
  expect(hide).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(true);

  await act(() => root.render(app(false)));
  expect(hide).toHaveBeenCalledTimes(2);

  // Explicit false -> omitted is a change to true.
  await act(() => root.render(app(undefined)));
  expect(show).toHaveBeenCalledTimes(2);
  expect(overlay().hidden).toBe(false);
  await act(() => root.unmount());
});

it("updates non-visible options through updateHandle without remount or replay", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (stroke: string, description?: string) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, stroke, description, onHandle }),
    );
  const root = await render(app("red"));
  const handle = calls[0]!;
  const element = overlay();
  const drawing = document.querySelector(".stet-svg path")!.getAttribute("d");

  await act(() => root.render(app("blue", "Explained")));
  expect(calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(ink()).toBe("blue");
  expect(document.querySelector(".stet-description")?.textContent).toBe("Explained");
  expect(document.querySelector(".stet-svg path")!.getAttribute("d")).toBe(drawing);
  expect(target.current!.getAttribute("aria-describedby")).toContain("stet-description-");
  await act(() => root.unmount());
});

it("sends a complete snapshot so removed values return to defaults", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (padding?: number, description?: string) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, padding, description, onHandle }),
    );
  const root = await render(app(20, "A"));
  const handle = calls[0]!;
  const wide = parseFloat(overlay().style.width);
  expect(document.querySelector(".stet-description")).not.toBeNull();

  await act(() => root.render(app()));
  expect(parseFloat(overlay().style.width)).toBeLessThan(wide);
  expect(document.querySelector(".stet-description")).toBeNull();
  expect(calls).toEqual([handle]);
  await act(() => root.unmount());
});

it("preserves an imperative hide when unrelated options change", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (stroke: string) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, stroke, onHandle }),
    );
  const root = await render(app("red"));
  const handle = calls[0]!;
  handle.hide();
  expect(overlay().hidden).toBe(true);

  await act(() => root.render(app("blue")));
  expect(overlay().hidden).toBe(true);
  expect(ink()).toBe("blue");
  expect(calls).toEqual([handle]);
  await act(() => root.unmount());
});

it("transfers a live handle to a new callback without remount, update, or replay", async () => {
  const target = createRef<HTMLElement>();
  const a = collector();
  const b = collector();
  const app = (onHandle: Callback) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, onHandle }),
    );
  const root = await render(app(a.onHandle));
  const handle = a.calls[0]!;
  const element = overlay();
  const replay = vi.spyOn(handle, "replay");
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");
  const destroy = vi.spyOn(handle, "destroy");

  await act(() => root.render(app(b.onHandle)));
  expect(a.calls).toEqual([handle, null]);
  expect(b.calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(replay).not.toHaveBeenCalled();
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();
  // The new owner, not the old one, receives the null on unmount.
  await act(() => root.unmount());
  expect(b.calls).toEqual([handle, null]);
});

it("still delivers the handle when the outgoing callback throws", async () => {
  const target = createRef<HTMLElement>();
  const seen: (StetHandle | null)[] = [];
  const oldCallback: Callback = (handle) => {
    if (handle === null) throw new Error("old callback failed");
    seen.push(handle);
  };
  const next = collector();
  const app = (onHandle: Callback) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, onHandle }),
    );
  const root = await render(app(oldCallback));
  const handle = seen[0]!;

  let error: unknown;
  try {
    await act(() => root.render(app(next.onHandle)));
  } catch (caught) {
    error = caught;
  }
  // The callback error is not swallowed...
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe("old callback failed");
  // ...and the new owner is still notified of the existing handle, then owns
  // the teardown null when React unmounts the errored tree.
  expect(next.calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("notifies only when a callback appears or disappears", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (callback?: Callback) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, onHandle: callback }),
    );
  const root = await render(app());
  expect(calls).toHaveLength(0);

  await act(() => root.render(app(onHandle)));
  const handle = calls[0]!;
  await act(() => root.render(app()));
  expect(calls).toEqual([handle, null]);
  await act(() => root.render(app(onHandle)));
  expect(calls).toEqual([handle, null, handle]);
  await act(() => root.unmount());
});

it("replaces the handle when a stable ref points at a new DOM node", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (tag: string) =>
    createElement(
      Fragment,
      null,
      createElement(tag, { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, description: "D", onHandle }),
    );
  const root = await render(app("button"));
  const first = calls[0]!;
  const firstOverlay = overlay();
  const oldNode = target.current!;
  expect(oldNode.getAttribute("aria-describedby")).toContain("stet-description-");

  await act(() => root.render(app("a")));
  expect(calls[0]).toBe(first);
  expect(calls[1]).toBeNull();
  const second = calls[2]!;
  expect(second).not.toBe(first);
  expect(calls).toHaveLength(3);
  expect(overlay()).not.toBe(firstOverlay);
  expect(oldNode.hasAttribute("aria-describedby")).toBe(false);
  expect(target.current!.getAttribute("aria-describedby")).toContain("stet-description-");
  await act(() => root.unmount());
});

it("attaches a replacement with current declarative visibility, not imperative state", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (tag: string) =>
    createElement(
      Fragment,
      null,
      createElement(tag, { ref: target }, "Save"),
      createElement(Circle, { target, seed: 1, onHandle }),
    );
  const root = await render(app("button"));
  calls[0]!.hide();
  expect(overlay().hidden).toBe(true);

  await act(() => root.render(app("a")));
  expect(overlay().hidden).toBe(false);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(calls[0]);
  await act(() => root.unmount());
});

it("does not notify null before a handle ever exists", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (present: boolean) =>
    createElement(
      Fragment,
      null,
      present && createElement("button", { ref: target }, "Save"),
      createElement(Circle, { target, onHandle }),
    );
  const root = await render(app(false));
  expect(calls).toHaveLength(0);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  await act(() => root.render(app(true)));
  expect(calls).toHaveLength(1);
  expect(calls[0]).not.toBeNull();
  await act(() => root.unmount());
});

it("updates an arrow label in place and replaces the handle when 'to' changes", async () => {
  const from = createRef<HTMLButtonElement>();
  const to = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (toTag: string, label: string) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: from }, "From"),
      createElement(toTag, { ref: to }, "To"),
      createElement(Arrow, { from, to, label, seed: 1, curvature: -0.3, onHandle }),
    );
  const root = await render(app("button", "One"));
  const handle = calls[0]!;
  expect(document.querySelector(".stet-label")?.textContent).toBe("One");

  await act(() => root.render(app("button", "Two")));
  expect(document.querySelector(".stet-label")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);

  await act(() => root.render(app("a", "Two")));
  expect(calls[0]).toBe(handle);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(handle);
  expect(calls).toHaveLength(3);
  await act(() => root.unmount());
});

it("attaches an Arrow replacement even when the outgoing owner throws on null", async () => {
  const from = createRef<HTMLButtonElement>();
  const to = createRef<HTMLElement>();
  const seen: StetHandle[] = [];
  const outgoing: Callback = (handle) => {
    if (handle === null) throw new Error("outgoing failed");
    seen.push(handle);
  };
  const next = collector();
  const app = (toTag: string, onHandle: Callback) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: from }, "From"),
      createElement(toTag, { ref: to }, "To"),
      createElement(Arrow, { from, to, label: "L", seed: 1, onHandle }),
    );
  const root = await render(app("button", outgoing));
  const handle = seen[0]!;
  const firstOverlay = overlay();
  const oldNode = to.current!;
  expect(oldNode.getAttribute("aria-describedby")).toContain("stet-description-");

  let error: unknown;
  try {
    await act(() => root.render(app("a", next.onHandle)));
  } catch (caught) {
    error = caught;
  }
  // The outgoing exception is surfaced, not swallowed...
  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe("outgoing failed");
  expect(seen).toEqual([handle]);
  // ...the old target was torn down, and a fresh replacement still attached and
  // reached the new owner despite the throw.
  expect(oldNode.hasAttribute("aria-describedby")).toBe(false);
  expect(firstOverlay.isConnected).toBe(false);
  expect(next.calls).toHaveLength(2);
  const replacement = next.calls[0]!;
  expect(replacement).not.toBeNull();
  expect(replacement).not.toBe(handle);
  // React unmounts the errored tree, so the new owner receives the teardown null.
  expect(next.calls).toEqual([replacement, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("updates mark kind in place without remount", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (kind: "right" | "wrong") =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Mark, { target, kind, seed: 1, onHandle }),
    );
  const root = await render(app("right"));
  const handle = calls[0]!;
  expect(document.querySelector(".stet-mark--right")).not.toBeNull();

  await act(() => root.render(app("wrong")));
  expect(document.querySelector(".stet-mark--wrong")).not.toBeNull();
  expect(document.querySelector(".stet-mark--right")).toBeNull();
  expect(calls).toEqual([handle]);
  await act(() => root.unmount());
});

it("updates sticky text in place without remount", async () => {
  const target = createRef<HTMLElement>();
  const { calls, onHandle } = collector();
  const app = (text: string) =>
    createElement(
      Fragment,
      null,
      createElement("button", { ref: target }, "Save"),
      createElement(Sticky, { target, text, seed: 1, onHandle }),
    );
  const root = await render(app("One"));
  const handle = calls[0]!;
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("One");

  await act(() => root.render(app("Two")));
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);
  await act(() => root.unmount());
});
