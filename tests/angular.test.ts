import "@angular/compiler";
import { Component, provideZonelessChangeDetection, type Type } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { BrowserTestingModule, platformBrowserTesting } from "@angular/platform-browser/testing";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import {
  StetArrowDirective,
  StetCircleDirective,
  StetMarkDirective,
  StetStickyDirective,
} from "../src/angular.js";
import type {
  ArrowOptions,
  MarkKind,
  StetHandle,
  StetOptions,
  StickyOptions,
} from "../src/index.js";

type Callback = (handle: StetHandle | null) => void;

/**
 * happy-dom returns zero-sized rects, which the runtime treats as culled. Pin a
 * fixed onscreen box so overlay `hidden` reflects explicit visibility, not
 * geometry.
 */
const RECT = new DOMRect(10, 20, 100, 30);

// Runtime JIT compilation of the consumer templates below needs the compiler.
beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    teardown: { destroyAfterEach: true },
  });
});

beforeEach(() => {
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(RECT);
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([RECT] as unknown as DOMRectList);
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
});

afterEach(() => {
  TestBed.resetTestingModule();
  document.body.textContent = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

@Component({
  selector: "ad-circle-host",
  standalone: true,
  imports: [StetCircleDirective],
  template: `<button class="host" [stetCircle]="options" [stetOnHandle]="onHandle">Save</button>`,
})
class CircleHost {
  options: StetOptions = {};
  onHandle?: Callback;
}

@Component({
  selector: "ad-arrow-host",
  standalone: true,
  imports: [StetArrowDirective],
  template: `<button class="host" [stetArrow]="options" [stetOnHandle]="onHandle">From</button>`,
})
class ArrowHost {
  options: ArrowOptions & { to?: Element | null } = {};
  onHandle?: Callback;
}

@Component({
  selector: "ad-mark-host",
  standalone: true,
  imports: [StetMarkDirective],
  template: `<button class="host" [stetMark]="options" [stetOnHandle]="onHandle">Save</button>`,
})
class MarkHost {
  options: StetOptions & { kind: MarkKind } = { kind: "right" };
  onHandle?: Callback;
}

@Component({
  selector: "ad-sticky-host",
  standalone: true,
  imports: [StetStickyDirective],
  template: `<button class="host" [stetSticky]="options" [stetOnHandle]="onHandle">Save</button>`,
})
class StickyHost {
  options: StickyOptions = { text: "" };
  onHandle?: Callback;
}

/** Consumer template whose host element is swapped or removed by control flow. */
@Component({
  selector: "ad-swap-host",
  standalone: true,
  imports: [StetCircleDirective],
  template: `@if (present) {
    @if (tag === "button") {
      <button class="host" [stetCircle]="options" [stetOnHandle]="onHandle">Save</button>
    } @else {
      <a class="host" [stetCircle]="options" [stetOnHandle]="onHandle">Save</a>
    }
  }`,
})
class SwapHost {
  present = true;
  tag: "button" | "a" = "button";
  options: StetOptions = {};
  onHandle?: Callback;
}

function collector(): { calls: (StetHandle | null)[]; onHandle: Callback } {
  const calls: (StetHandle | null)[] = [];
  return { calls, onHandle: (handle) => calls.push(handle) };
}

/** Create, configure before the deferred first render, then render once. */
function create<T>(type: Type<T>, configure?: (instance: T) => void): ComponentFixture<T> {
  const fixture = TestBed.createComponent(type);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  TestBed.tick();
  return fixture;
}

function update<T>(fixture: ComponentFixture<T>, configure: (instance: T) => void): void {
  configure(fixture.componentInstance);
  fixture.changeDetectorRef.markForCheck();
  TestBed.tick();
}

function overlay(): HTMLElement {
  return document.querySelector<HTMLElement>(".stet-overlay")!;
}

function ink(): string {
  return overlay().style.getPropertyValue("--stet-ink");
}

it("compiles the inherited stetOnHandle input, then reports null on destroy", () => {
  const { calls, onHandle } = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1 };
    host.onHandle = onHandle;
  });

  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();
  expect(document.querySelectorAll(".stet-overlay")).toHaveLength(1);

  fixture.destroy();
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("defers attachment until after the first render", () => {
  const fixture = TestBed.createComponent(CircleHost);
  fixture.componentInstance.options = { seed: 1 };

  // The constructor runs during creation; afterNextRender keeps the DOM untouched.
  expect(document.querySelector(".stet-overlay")).toBeNull();

  fixture.detectChanges();
  TestBed.tick();
  expect(document.querySelector(".stet-overlay")).not.toBeNull();
  fixture.destroy();
});

it("applies a changed visible value once and preserves imperative state", () => {
  const { calls, onHandle } = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1, visible: false };
    host.onHandle = onHandle;
  });
  expect(overlay().hidden).toBe(true);
  const handle = calls[0]!;
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");

  update(fixture, (host) => {
    host.options = { seed: 1, visible: false };
  });
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();

  update(fixture, (host) => {
    host.options = { seed: 1, visible: true };
  });
  expect(show).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(false);

  handle.hide();
  expect(hide).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(true);

  // An unrelated update must not overwrite the imperative hide.
  update(fixture, (host) => {
    host.options = { seed: 1, visible: true, stroke: "green" };
  });
  expect(hide).toHaveBeenCalledTimes(1);
  expect(show).toHaveBeenCalledTimes(1);
  expect(overlay().hidden).toBe(true);

  update(fixture, (host) => {
    host.options = { seed: 1, visible: false, stroke: "green" };
  });
  expect(hide).toHaveBeenCalledTimes(2);

  // Explicit false -> omitted is a change to the default true.
  update(fixture, (host) => {
    host.options = { seed: 1, stroke: "green" };
  });
  expect(show).toHaveBeenCalledTimes(2);
  expect(overlay().hidden).toBe(false);
});

it("updates style, description, and placement in place without remount or replay", () => {
  const { calls, onHandle } = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1, stroke: "red" };
    host.onHandle = onHandle;
  });

  const handle = calls[0]!;
  const element = overlay();
  const replay = vi.spyOn(handle, "replay");
  const narrow = parseFloat(overlay().style.width);

  update(fixture, (host) => {
    host.options = { seed: 1, stroke: "blue", description: "Explained", padding: 20 };
  });

  expect(calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(ink()).toBe("blue");
  expect(document.querySelector(".stet-description")?.textContent).toBe("Explained");
  expect(replay).not.toHaveBeenCalled();
  expect(parseFloat(overlay().style.width)).toBeGreaterThan(narrow);
  expect(document.querySelector("button.host")!.getAttribute("aria-describedby")).toContain(
    "stet-description-",
  );
});

it("sends a complete snapshot so removed values return to defaults", () => {
  const { calls, onHandle } = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1, padding: 20, description: "A" };
    host.onHandle = onHandle;
  });

  const handle = calls[0]!;
  const wide = parseFloat(overlay().style.width);
  expect(document.querySelector(".stet-description")).not.toBeNull();

  update(fixture, (host) => {
    host.options = { seed: 1 };
  });

  expect(parseFloat(overlay().style.width)).toBeLessThan(wide);
  expect(document.querySelector(".stet-description")).toBeNull();
  expect(calls).toEqual([handle]);
});

it("updates primitive-specific options in place: mark kind and sticky text", () => {
  const markCollector = collector();
  const markFixture = create(MarkHost, (host) => {
    host.options = { kind: "right", seed: 1 };
    host.onHandle = markCollector.onHandle;
  });
  const markHandle = markCollector.calls[0]!;
  expect(document.querySelector(".stet-mark--right")).not.toBeNull();

  update(markFixture, (host) => {
    host.options = { kind: "wrong", seed: 1 };
  });
  expect(document.querySelector(".stet-mark--wrong")).not.toBeNull();
  expect(document.querySelector(".stet-mark--right")).toBeNull();
  expect(markCollector.calls).toEqual([markHandle]);

  const stickyCollector = collector();
  const stickyFixture = create(StickyHost, (host) => {
    host.options = { text: "One", seed: 1 };
    host.onHandle = stickyCollector.onHandle;
  });
  const stickyHandle = stickyCollector.calls[0]!;
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("One");

  update(stickyFixture, (host) => {
    host.options = { text: "Two", seed: 1 };
  });
  expect(document.querySelector(".stet-sticky-text")?.textContent).toBe("Two");
  expect(stickyCollector.calls).toEqual([stickyHandle]);
});

it("transfers a live handle to a new callback without remount, update, or replay", () => {
  const a = collector();
  const b = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1 };
    host.onHandle = a.onHandle;
  });

  const handle = a.calls[0]!;
  const element = overlay();
  const replay = vi.spyOn(handle, "replay");
  const show = vi.spyOn(handle, "show");
  const hide = vi.spyOn(handle, "hide");
  const destroy = vi.spyOn(handle, "destroy");

  update(fixture, (host) => {
    host.onHandle = b.onHandle;
  });
  expect(a.calls).toEqual([handle, null]);
  expect(b.calls).toEqual([handle]);
  expect(overlay()).toBe(element);
  expect(replay).not.toHaveBeenCalled();
  expect(show).not.toHaveBeenCalled();
  expect(hide).not.toHaveBeenCalled();
  expect(destroy).not.toHaveBeenCalled();

  // The new owner, not the old one, receives the teardown null.
  fixture.destroy();
  expect(b.calls).toEqual([handle, null]);
});

it("still delivers the existing handle when the outgoing callback throws", () => {
  const seen: (StetHandle | null)[] = [];
  const outgoing: Callback = (handle) => {
    if (handle === null) throw new Error("old callback failed");
    seen.push(handle);
  };
  const next = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1 };
    host.onHandle = outgoing;
  });
  const handle = seen[0]!;

  let error: unknown;
  try {
    update(fixture, (host) => {
      host.onHandle = next.onHandle;
    });
  } catch (caught) {
    error = caught;
  }

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toBe("old callback failed");
  // The new owner still receives the existing handle, then the teardown null.
  expect(next.calls).toEqual([handle]);
  fixture.destroy();
  expect(next.calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("waits silently for an absent Arrow destination and reports null when it disappears", () => {
  const { calls, onHandle } = collector();
  const destination = document.createElement("p");
  document.body.append(destination);
  const fixture = create(ArrowHost, (host) => {
    host.options = { to: undefined, seed: 1 };
    host.onHandle = onHandle;
  });

  // No attach and no null notification while the destination is absent.
  expect(calls).toHaveLength(0);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  update(fixture, (host) => {
    host.options = { to: destination, seed: 1 };
  });
  expect(calls).toHaveLength(1);
  const handle = calls[0]!;
  expect(handle).not.toBeNull();

  update(fixture, (host) => {
    host.options = { to: null, seed: 1 };
  });
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();

  // A reappearing destination attaches a fresh handle.
  update(fixture, (host) => {
    host.options = { to: destination, seed: 1 };
  });
  expect(calls).toHaveLength(3);
  expect(calls[2]).not.toBe(handle);
});

it("replaces Arrow's destination, destroys the old handle, and moves owned ARIA", () => {
  const { calls, onHandle } = collector();
  const first = document.createElement("p");
  const second = document.createElement("p");
  document.body.append(first, second);
  const fixture = create(ArrowHost, (host) => {
    host.options = { to: first, seed: 1, label: "One" };
    host.onHandle = onHandle;
  });

  const handle = calls[0]!;
  const firstOverlay = overlay();
  expect(document.querySelector(".stet-label")?.textContent).toBe("One");
  expect(first.getAttribute("aria-describedby")).toContain("stet-description-");

  // A label change updates in place; the handle is not recreated.
  update(fixture, (host) => {
    host.options = { to: first, seed: 1, label: "Two" };
  });
  expect(document.querySelector(".stet-label")?.textContent).toBe("Two");
  expect(calls).toEqual([handle]);

  update(fixture, (host) => {
    host.options = { to: second, seed: 1, label: "Two" };
  });
  expect(calls[0]).toBe(handle);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(handle);
  expect(calls).toHaveLength(3);
  expect(overlay()).not.toBe(firstOverlay);
  expect(first.hasAttribute("aria-describedby")).toBe(false);
  expect(second.getAttribute("aria-describedby")).toContain("stet-description-");
});

it("replaces the host element, destroying the old handle and using declarative visibility", () => {
  const { calls, onHandle } = collector();
  const fixture = create(SwapHost, (host) => {
    host.options = { seed: 1, description: "D" };
    host.onHandle = onHandle;
  });

  const first = calls[0]!;
  const oldNode = document.querySelector("button.host")!;
  const firstOverlay = overlay();
  expect(oldNode.getAttribute("aria-describedby")).toContain("stet-description-");

  // An imperative hide must not carry to the replacement.
  first.hide();
  expect(overlay().hidden).toBe(true);

  update(fixture, (host) => {
    host.tag = "a";
  });
  expect(calls[0]).toBe(first);
  expect(calls[1]).toBeNull();
  expect(calls[2]).not.toBe(first);
  expect(calls).toHaveLength(3);
  expect(overlay()).not.toBe(firstOverlay);
  expect(overlay().hidden).toBe(false);
  expect(oldNode.hasAttribute("aria-describedby")).toBe(false);
  expect(document.querySelector("a.host")!.getAttribute("aria-describedby")).toContain(
    "stet-description-",
  );
});

it("destroys and nulls the handle when control flow removes the host", () => {
  const { calls, onHandle } = collector();
  const fixture = create(SwapHost, (host) => {
    host.options = { seed: 1 };
    host.onHandle = onHandle;
  });
  const handle = calls[0]!;

  update(fixture, (host) => {
    host.present = false;
  });
  expect(calls).toEqual([handle, null]);
  expect(document.querySelector(".stet-overlay")).toBeNull();
});

it("applies changed animation options to the next entrance, not as an automatic replay", async () => {
  const { calls, onHandle } = collector();
  const fixture = create(CircleHost, (host) => {
    host.options = { seed: 1 };
    host.onHandle = onHandle;
  });
  const handle = calls[0]!;
  const replay = vi.spyOn(handle, "replay");
  const path = () => document.querySelector(".stet-svg path")!;

  // No animation configured: replay leaves the drawing at its final frame.
  await handle.replay();
  expect(path().getAttribute("stroke-dashoffset")).toBeNull();
  replay.mockClear();

  update(fixture, (host) => {
    host.options = { seed: 1, animate: true, animationDuration: 600 };
  });
  // The option change updates runtime state without replaying by itself.
  expect(replay).not.toHaveBeenCalled();

  // The next entrance primes the path-length reveal.
  const entrance = handle.replay();
  expect(parseFloat(path().getAttribute("stroke-dashoffset") ?? "0")).toBeGreaterThan(0);
  fixture.destroy();
  await entrance;
});
