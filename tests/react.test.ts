import { act, createElement, createRef, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it } from "vitest";
import { Circle, Arrow } from "../src/react.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(() => { document.body.textContent = ""; });

it("handles Strict Mode, ref reassignment, unchanged props, and unmount", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLElement>();
  const app = (tag: string, stroke = "red") => createElement(StrictMode, null,
    createElement(tag, { ref }, "Save"), createElement(Circle, { target: ref, seed: 7, stroke, description: "Important" }));
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
  expect(document.querySelector<HTMLElement>(".stet-overlay")?.style.getPropertyValue("--stet-ink")).toBe("blue");
  await act(() => root.unmount());
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("forwards arrow curvature, label updates, and null refs", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const from = createRef<HTMLButtonElement>(), to = createRef<HTMLButtonElement>();
  const app = (visible: boolean, label: string) => createElement("div", null,
    createElement("button", { ref: from }, "From"),
    visible && createElement("button", { ref: to }, "To"),
    createElement(Arrow, { from, to, label, curvature: -0.3, seed: 4 }));
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
