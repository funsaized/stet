import { afterEach, expect, it, vi } from "vitest";
import { circle } from "../src/svelte.js";

afterEach(() => {
  document.body.textContent = "";
  vi.unstubAllGlobals();
});

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
  expect(document.querySelector<HTMLElement>(".stet-overlay")?.style.getPropertyValue("--stet-ink")).toBe("blue");
  action.destroy();
});

it("allows simple actions without an options argument", () => {
  const element = document.createElement("button");
  document.body.append(element);
  const action = circle(element);
  expect(document.querySelector(".stet-overlay--circle")).not.toBeNull();
  action.destroy();
});
