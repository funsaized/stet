import { createApp, h, nextTick, reactive, withDirectives, type App } from "vue";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { vStetArrow, vStetCircle, vStetMark, vStetSticky } from "../src/vue.js";
import type { MarkKind, StetHandle } from "../src/index.js";

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

function mount(render: () => ReturnType<typeof h>): { app: App; root: HTMLElement } {
  const root = document.createElement("div");
  document.body.append(root);
  const app = createApp({ render });
  app.mount(root);
  return { app, root };
}

function overlay(): HTMLElement {
  return document.querySelector<HTMLElement>(".stet-overlay")!;
}

function ink(): string {
  return overlay().style.getPropertyValue("--stet-ink");
}

it("delivers the handle after attachment and null on unmount", () => {
  const { calls, onHandle } = collector();
  const { app, root } = mount(() =>
    withDirectives(h("button", "Save"), [[vStetCircle, { onHandle }]]),
  );

  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();
  app.unmount();
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
  root.remove();
});

it("tracks an edited reactive options object in place and destroys the directive", async () => {
  const options = reactive({ stroke: "red", seed: 7 });
  const { app, root } = mount(() => withDirectives(h("button", "Save"), [[vStetCircle, options]]));
  const before = overlay();
  expect(ink()).toBe("red");

  options.stroke = "purple";
  await nextTick();
  const after = overlay();
  // A non-visible option change updates through updateHandle, not a remount.
  expect(after).toBe(before);
  expect(ink()).toBe("purple");

  app.unmount();
  expect(document.querySelector(".stet-overlay")).toBeNull();
  root.remove();
});

it("applies a changed visible value once and preserves imperative state", async () => {
  const { calls, onHandle } = collector();
  const state = reactive<{ visible?: boolean; stroke: string }>({ visible: false, stroke: "red" });
  const { app, root } = mount(() =>
    withDirectives(h("button", "Save"), [
      [vStetCircle, { visible: state.visible, stroke: state.stroke, seed: 1, onHandle }],
    ]),
  );

  expect(overlay().hidden).toBe(true);
  const handle = calls[0]!;
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");

  // An unrelated update while hidden must not call show or hide.
  state.stroke = "blue";
  await nextTick();
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();
  expect(overlay().hidden).toBe(true);

  state.visible = true;
  await nextTick();
  expect(show).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(false);

  handle.hide();
  expect(hide).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(true);

  // An unrelated update must not overwrite the imperative hide.
  const showBefore = show.mock.calls.length;
  state.stroke = "green";
  await nextTick();
  expect(hide).toHaveBeenCalledTimes(1);
  expect(show).toHaveBeenCalledTimes(showBefore);
  expect(overlay().hidden).toBe(true);

  state.visible = false;
  await nextTick();
  expect(hide).toHaveBeenCalledTimes(2);

  // Explicit false -> omitted is a change to the default true.
  state.visible = undefined;
  await nextTick();
  expect(show).toHaveBeenCalledTimes(2);
  expect(overlay().hidden).toBe(false);

  app.unmount();
  root.remove();
});

it("updates non-visible options through updateHandle without remount or replay", async () => {
  const { calls, onHandle } = collector();
  const state = reactive<{ stroke: string; description?: string }>({ stroke: "red" });
  const { app, root } = mount(() =>
    withDirectives(h("button", "Save"), [[vStetCircle, { ...state, seed: 1, onHandle }]]),
  );

  const handle = calls[0]!;
  const element = overlay();
  const drawing = document.querySelector(".stet-svg path")!.getAttribute("d");

  state.stroke = "blue";
  state.description = "Explained";
  await nextTick();
  expect(calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(ink()).toBe("blue");
  expect(document.querySelector(".stet-description")?.textContent).toBe("Explained");
  expect(document.querySelector(".stet-svg path")!.getAttribute("d")).toBe(drawing);
  expect(document.querySelector("button")!.getAttribute("aria-describedby")).toContain(
    "stet-description-",
  );

  app.unmount();
  root.remove();
});

it("sends a complete snapshot so removed values return to defaults", async () => {
  const { calls, onHandle } = collector();
  const state = reactive<{ padding?: number; description?: string }>({
    padding: 20,
    description: "A",
  });
  const { app, root } = mount(() =>
    withDirectives(h("button", "Save"), [[vStetCircle, { ...state, seed: 1, onHandle }]]),
  );

  const handle = calls[0]!;
  const wide = parseFloat(overlay().style.width);
  expect(document.querySelector(".stet-description")).not.toBeNull();

  state.padding = undefined;
  state.description = undefined;
  await nextTick();
  expect(parseFloat(overlay().style.width)).toBeLessThan(wide);
  expect(document.querySelector(".stet-description")).toBeNull();
  expect(calls).toEqual([handle]);

  app.unmount();
  root.remove();
});

it("transfers a live handle to a new callback without remount, update, or replay", async () => {
  const a = collector();
  const b = collector();
  const state = reactive<{ onHandle: Callback }>({ onHandle: a.onHandle });
  const { app, root } = mount(() =>
    withDirectives(h("button", "Save"), [[vStetCircle, { seed: 1, onHandle: state.onHandle }]]),
  );

  const handle = a.calls[0]!;
  const element = overlay();
  const replay = vi.spyOn(handle, "replay");
  const destroy = vi.spyOn(handle, "destroy");

  state.onHandle = b.onHandle;
  await nextTick();
  expect(a.calls).toEqual([handle, null]);
  expect(b.calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(replay).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  // The new owner, not the old one, receives the teardown null.
  app.unmount();
  expect(b.calls).toEqual([handle, null]);
  root.remove();
});

it("replaces the handle when Arrow's destination changes", async () => {
  const { calls, onHandle } = collector();
  const first = document.createElement("p");
  const second = document.createElement("p");
  document.body.append(first, second);
  const state = reactive<{ to: Element; label: string }>({ to: first, label: "One" });
  const { app, root } = mount(() =>
    withDirectives(h("button", "From"), [[vStetArrow, { ...state, seed: 1, onHandle }]]),
  );

  const handle = calls[0]!;
  const firstOverlay = overlay();
  expect(document.querySelector(".stet-label")?.textContent).toBe("One");
  expect(first.getAttribute("aria-describedby")).toContain("stet-description-");

  state.label = "Two";
  await nextTick();
  expect(document.querySelector(".stet-label")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);

  state.to = second;
  await nextTick();
  expect(calls[0]).toBe(handle);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(handle);
  expect(calls).toHaveLength(3);
  // The old overlay and its owned ARIA relationship are torn down; the
  // replacement attaches to the new destination.
  expect(overlay()).not.toBe(firstOverlay);
  expect(first.hasAttribute("aria-describedby")).toBe(false);
  expect(second.getAttribute("aria-describedby")).toContain("stet-description-");

  app.unmount();
  root.remove();
});

it("waits silently for an absent Arrow destination and reports null when it disappears", async () => {
  const { calls, onHandle } = collector();
  const destination = document.createElement("p");
  document.body.append(destination);
  const state = reactive<{ to?: Element | null }>({ to: undefined });
  const { app, root } = mount(() =>
    withDirectives(h("button", "From"), [[vStetArrow, { to: state.to, seed: 1, onHandle }]]),
  );

  // No attach and no null notification while the destination is absent.
  expect(calls).toHaveLength(0);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  state.to = destination;
  await nextTick();
  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();

  state.to = null;
  await nextTick();
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  // A reappearing destination attaches a fresh handle.
  state.to = destination;
  await nextTick();
  expect(calls).toHaveLength(3);
  expect(calls[2]).not.toBe(handle);

  app.unmount();
  root.remove();
});

it("reports null and reattaches when the directive host element is replaced", async () => {
  const { calls, onHandle } = collector();
  const state = reactive<{ tag: "button" | "a" }>({ tag: "button" });
  const { app, root } = mount(() =>
    withDirectives(h(state.tag, "Save"), [[vStetCircle, { seed: 1, description: "D", onHandle }]]),
  );

  const first = calls[0]!;
  const oldNode = document.querySelector("button")!;
  const firstOverlay = overlay();
  expect(oldNode.getAttribute("aria-describedby")).toContain("stet-description-");

  // An imperative hide must not carry to the replacement; the new handle uses
  // the current declarative visibility (default true).
  first.hide();
  expect(overlay().hidden).toBe(true);

  state.tag = "a";
  await nextTick();
  expect(calls[0]).toBe(first);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(first);
  expect(calls).toHaveLength(3);
  expect(overlay()).not.toBe(firstOverlay);
  expect(overlay().hidden).toBe(false);

  // The old host's owned ARIA relationship is gone; the new one is live.
  expect(oldNode.hasAttribute("aria-describedby")).toBe(false);
  expect(document.querySelector("a")!.getAttribute("aria-describedby")).toContain(
    "stet-description-",
  );

  app.unmount();
  root.remove();
});

it("attaches the Arrow replacement even when the outgoing owner throws on null", async () => {
  const seen: StetHandle[] = [];
  const outgoing: Callback = (handle) => {
    if (handle === null) throw new Error("outgoing failed");
    seen.push(handle);
  };
  const next = collector();
  const first = document.createElement("p");
  const second = document.createElement("p");
  document.body.append(first, second);
  const state = reactive<{ to: Element; onHandle: Callback }>({ to: first, onHandle: outgoing });
  const root = document.createElement("div");
  document.body.append(root);
  const app = createApp({
    render: () =>
      withDirectives(h("button", "From"), [
        [vStetArrow, { to: state.to, seed: 1, label: "L", onHandle: state.onHandle }],
      ]),
  });
  const errors: unknown[] = [];
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  app.mount(root);
  const handle = seen[0]!;
  const firstOverlay = overlay();

  state.to = second;
  state.onHandle = next.onHandle;
  await nextTick();
  // The outgoing exception is surfaced, not swallowed...
  expect(errors).toHaveLength(1);
  expect((errors[0] as Error).message).toBe("outgoing failed");
  expect(seen).toEqual([handle]);
  // ...and the valid replacement still attached and reached the new owner.
  expect(next.calls).toHaveLength(1);
  const replacement = next.calls[0]!;
  expect(replacement).not.toBe(handle);
  expect(overlay()).not.toBe(firstOverlay);
  expect(first.hasAttribute("aria-describedby")).toBe(false);

  // The new owner receives the teardown null.
  app.unmount();
  expect(next.calls).toEqual([replacement, null]);
  root.remove();
});

it("still delivers the existing handle when the outgoing callback throws", async () => {
  const seen: (StetHandle | null)[] = [];
  const oldCallback: Callback = (handle) => {
    if (handle === null) throw new Error("old callback failed");
    seen.push(handle);
  };
  const next = collector();
  const state = reactive<{ onHandle: Callback }>({ onHandle: oldCallback });
  const root = document.createElement("div");
  document.body.append(root);
  const app = createApp({
    render: () =>
      withDirectives(h("button", "Save"), [[vStetCircle, { seed: 1, onHandle: state.onHandle }]]),
  });
  const errors: unknown[] = [];
  // Vue catches directive hook errors and routes them here; the adapter must
  // neither swallow nor duplicate the delivery.
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  app.mount(root);
  const handle = seen[0]!;

  state.onHandle = next.onHandle;
  await nextTick();
  expect(errors).toHaveLength(1);
  expect((errors[0] as Error).message).toBe("old callback failed");
  // The outgoing failure does not stop the new owner from receiving the handle.
  expect(next.calls).toEqual([handle]);

  app.unmount();
  expect(next.calls).toEqual([handle, null]);
  root.remove();
});

it("updates primitive-specific options in place: mark kind and sticky text", async () => {
  const mark = reactive<{ kind: MarkKind }>({ kind: "right" });
  const markCollector = collector();
  const markApp = mount(() =>
    withDirectives(h("button", "Save"), [
      [vStetMark, { kind: mark.kind, seed: 1, onHandle: markCollector.onHandle }],
    ]),
  );
  const markHandle = markCollector.calls[0]!;
  expect(document.querySelector(".stet-mark--right")).not.toBeNull();

  mark.kind = "wrong";
  await nextTick();
  expect(document.querySelector(".stet-mark--wrong")).not.toBeNull();
  expect(document.querySelector(".stet-mark--right")).toBeNull();
  expect(markCollector.calls).toEqual([markHandle]);
  markApp.app.unmount();
  markApp.root.remove();

  const sticky = reactive<{ text: string }>({ text: "One" });
  const stickyCollector = collector();
  const stickyApp = mount(() =>
    withDirectives(h("button", "Save"), [
      [vStetSticky, { text: sticky.text, seed: 1, onHandle: stickyCollector.onHandle }],
    ]),
  );
  const stickyHandle = stickyCollector.calls[0]!;
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("One");

  sticky.text = "Two";
  await nextTick();
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
  expect(stickyCollector.calls).toEqual([stickyHandle]);
  stickyApp.app.unmount();
  stickyApp.root.remove();
});
