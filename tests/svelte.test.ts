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
