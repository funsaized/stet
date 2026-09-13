import { randomSeed } from "./prng.js";
import { type RoughOptions, variants } from "./rough.js";

export interface StetOptions {
  seed?: number;
  roughness?: number;
  boil?: number;
  stroke?: string;
  fill?: string;
  width?: number;
  resketchOnHover?: boolean;
  padding?: number;
  /** Whether the annotation starts visible. Defaults to true. */
  visible?: boolean;
  /** Opt into reveal animation. Defaults to off unless duration or delay is supplied. */
  animate?: boolean;
  /** Reveal duration in milliseconds. Defaults to 600 when animation is enabled. */
  animationDuration?: number;
  /** Delay before reveal in milliseconds. Defaults to 0 when animation is enabled. */
  animationDelay?: number;
  /** Accessible meaning for an otherwise decorative mark. */
  description?: string;
}

export type StetAnimationResult = { status: "finished" | "cancelled" };

export interface StetHandle {
  /** Clear explicit hiding and re-expose owned ARIA relationships. */
  show(): Promise<StetAnimationResult>;
  /** Explicitly hide and detach owned ARIA relationships until show(). */
  hide(): void;
  /** Restore visibility at the current seed and start a fresh entrance. */
  replay(): Promise<StetAnimationResult>;
  resketch(seed?: number): void;
  /** Follow a layout change without changing the drawing's seed. */
  refresh(): void;
  destroy(): void;
}

/** A Stet-owned aria-describedby relationship that survives hide/show. */
export interface AriaLink {
  attach(): void;
  detach(): void;
  remove(): void;
}

export interface MountedAnnotation {
  handle: StetHandle;
  /** Register an owned ARIA relationship with this annotation's lifecycle. */
  own(link: AriaLink): void;
}

export interface RenderContext<O extends StetOptions = StetOptions> {
  rough: RoughOptions;
  /** Live snapshotted runtime options; replaced wholesale by updateHandle. */
  options: O;
  /** Register an owned ARIA relationship with this annotation's lifecycle. */
  own(link: AriaLink): void;
  /** Drop a previously owned relationship and remove its ID immediately. */
  disown(link: AriaLink): void;
}

export interface Renderer<O extends StetOptions = StetOptions> {
  (root: HTMLDivElement, svg: SVGSVGElement, context: RenderContext<O>): void;
}

/**
 * Complete flat runtime snapshot accepted by {@link updateHandle}. It excludes
 * `visible`, `onHandle`, and adapter targets; primitive-specific keys travel
 * through to the renderer untouched.
 */
export type StetRuntimeOptions = StetOptions | Record<string, unknown>;

const updateCapability: unique symbol = Symbol("stet.update");

interface UpdateCapability {
  update(options: StetRuntimeOptions): void;
}

function sameRuntimeOptions(a: StetOptions, b: StetOptions): boolean {
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  keys.delete("visible");
  keys.delete("onHandle");
  for (const key of keys) {
    if (left[key] !== right[key]) return false;
  }
  return true;
}

/**
 * Source-only nonreplaying update path. Adapters import this directly from
 * `src/mount.ts`; it is intentionally not re-exported by the package entry and
 * is absent from {@link StetHandle}. `visible` and adapter metadata are ignored.
 */
export function updateHandle(handle: StetHandle, nextOptions: StetRuntimeOptions): void {
  const capability = (handle as unknown as { [updateCapability]?: UpdateCapability })[
    updateCapability
  ];
  if (!capability) throw new TypeError("stet: updateHandle requires a handle created by stet");
  capability.update(nextOptions);
}

const SVG_NS = "http://www.w3.org/2000/svg";

// CORE-02 reveal support; BOX-02 adds "box" when that primitive becomes public.
const revealSupported = new Set(["circle", "underline"]);

// CORE-03/CORE-04 path-length draw-on shared by every stroked primitive; the
// mechanism stays one treatment rather than a per-primitive controller.
const strokedRevealPrimitives = new Set(["circle", "underline"]);

export interface ResolvedAnimation {
  enabled: boolean;
  duration: number;
  delay: number;
}

/** Resolve flat animation options. Timing validation lives in assertRevealSupport. */
export function resolveAnimation(options: StetOptions): ResolvedAnimation {
  const optedIn = options.animationDuration !== undefined || options.animationDelay !== undefined;
  return {
    enabled: options.animate === true || (options.animate !== false && optedIn),
    duration: options.animationDuration ?? 600,
    delay: options.animationDelay ?? 0,
  };
}

/** Validate timing and reveal support before any DOM or ARIA mutation. */
export function assertRevealSupport(primitive: string, options: StetOptions): void {
  for (const [name, value] of [
    ["animationDuration", options.animationDuration],
    ["animationDelay", options.animationDelay],
  ] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new RangeError(`stet: ${name} must be a finite, nonnegative number`);
    }
  }
  if (resolveAnimation(options).enabled && !revealSupported.has(primitive)) {
    throw new TypeError(`stet: animation is not supported by ${primitive}`);
  }
}

// A single passive listener coalesces tracking for overlays that cannot scroll
// natively with the document (nested scrollers and viewport-aware notes).
const scrollUpdates = new Set<() => void>();
let scrollFrame: number | undefined;
function onScroll(): void {
  if (scrollFrame !== undefined) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = undefined;
    scrollUpdates.forEach((update) => update());
  });
}

function trackScroll(update: () => void): () => void {
  if (!scrollUpdates.size)
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
  scrollUpdates.add(update);
  return () => {
    scrollUpdates.delete(update);
    if (!scrollUpdates.size) {
      window.removeEventListener("scroll", onScroll, true);
      if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame);
      scrollFrame = undefined;
    }
  };
}

function scrollsWithDocument(target: Element): boolean {
  for (let node: Element | null = target; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.position === "fixed" || style.position === "sticky") return false;
    if (
      node !== target &&
      node !== document.body &&
      node !== document.documentElement &&
      /auto|scroll|hidden|overlay/.test(`${style.overflowX} ${style.overflowY}`)
    )
      return false;
  }
  return true;
}

export function assertElement(value: unknown, name = "element"): asserts value is Element {
  if (typeof Element === "undefined" || !(value instanceof Element)) {
    throw new TypeError(`stet: expected ${name} to be an Element`);
  }
}

export function createPath(
  svg: SVGSVGElement,
  className: string,
  generate: (options: RoughOptions) => string,
  options: RoughOptions,
): void {
  const paths = variants(generate, options, options.boil ? 3 : 1);
  paths.forEach((d, index) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", paths.length > 1 ? `stet-boil ${className}` : className);
    path.dataset.i = String(index);
    svg.append(path);
  });
}

export function place(
  root: HTMLDivElement,
  svg: SVGSVGElement,
  left: number,
  top: number,
  width: number,
  height: number,
): void {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  if (root.style.position === "absolute") {
    // Account for a positioned body as well as the initial containing block.
    const parent = root.offsetParent as HTMLElement | null;
    if (parent && getComputedStyle(parent).position !== "static") {
      const rect = parent.getBoundingClientRect();
      left += parent.scrollLeft - rect.left - parent.clientLeft;
      top += parent.scrollTop - rect.top - parent.clientTop;
    } else {
      left += window.scrollX;
      top += window.scrollY;
    }
  }
  root.style.left = `${left}px`;
  root.style.top = `${top}px`;
  root.style.width = `${w}px`;
  root.style.height = `${h}px`;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
}

export function clientBoxes(element: Element, text = false): DOMRect[] {
  let source = element.getClientRects();
  if (
    text &&
    element.matches("p,h1,h2,h3,h4,h5,h6,blockquote,li,span,a,strong,em,b,i,small,code,label") &&
    element.textContent?.trim()
  ) {
    const range = document.createRange();
    range.selectNodeContents(element);
    source = range.getClientRects();
  }
  const rects: DOMRect[] = [];
  for (const rect of Array.from(source).filter((r) => r.width && r.height)) {
    const line = rects.findIndex((r) => {
      const overlap = Math.min(r.bottom, rect.bottom) - Math.max(r.top, rect.top);
      return (
        overlap > Math.min(r.height, rect.height) * 0.6 &&
        Math.max(r.height, rect.height) < Math.min(r.height, rect.height) * 1.8
      );
    });
    if (line < 0) rects.push(rect);
    else rects[line] = bounds([rects[line], rect]);
  }
  if (rects.length > 0) return rects;
  return [element.getBoundingClientRect()];
}

export function bounds(rects: DOMRect[]): DOMRect {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return new DOMRect(left, top, right - left, bottom - top);
}

function applyTheme(root: HTMLElement, options: StetOptions): void {
  if (options.stroke) root.style.setProperty("--stet-ink", options.stroke);
  else root.style.removeProperty("--stet-ink");
  if (options.fill) root.style.setProperty("--stet-local-fill", options.fill);
  else root.style.removeProperty("--stet-local-fill");
  if (options.width !== undefined) root.style.setProperty("--stet-width", String(options.width));
}

const themeTokens = [
  "stroke",
  "fill",
  "paper",
  "width",
  "correct",
  "wrong",
  "note",
  "font",
  "z-index",
  "highlight-blend",
];

function inheritTheme(root: HTMLElement, target: Element, options: StetOptions): void {
  const style = getComputedStyle(target);
  const inherited = getComputedStyle(document.body);
  for (const token of themeTokens) {
    const property = `--stet-${token}`;
    const value = style.getPropertyValue(property);
    if (value && value !== inherited.getPropertyValue(property))
      root.style.setProperty(property, value);
    else root.style.removeProperty(property);
  }
  applyTheme(root, options);
}

let descriptionId = 0;

export function describe(element: Element, text: HTMLElement): AriaLink {
  let id: string;
  do {
    id = `stet-description-${++descriptionId}`;
  } while (document.getElementById(id));
  text.id = id;
  const read = () => element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  const write = (ids: string[]) => {
    if (ids.length) element.setAttribute("aria-describedby", ids.join(" "));
    else element.removeAttribute("aria-describedby");
  };
  const link: AriaLink = {
    attach() {
      const ids = read();
      // Append the owned ID once, after any foreign IDs the application owns.
      if (!ids.includes(id)) write([...ids, id]);
    },
    detach() {
      write(read().filter((value) => value !== id));
    },
    remove() {
      link.detach();
    },
  };
  link.attach();
  return link;
}

export function mount<O extends StetOptions>(
  targets: Element[],
  primitive: string,
  options: O,
  render: Renderer<O>,
  viewportAware = false,
  validate?: (options: O) => void,
): MountedAnnotation {
  assertRevealSupport(primitive, options);
  targets.forEach((target, index) =>
    assertElement(target, index ? `element ${index + 1}` : "element"),
  );
  if (!document.body) throw new Error("stet: document.body is required");

  // The live snapshot: updateHandle replaces it wholesale so removed values fall
  // back to defaults instead of lingering from a previous render.
  let runtime: O = { ...options };
  let lastSeedOption = options.seed;
  let seed = options.seed ?? randomSeed();

  const root = document.createElement("div");
  root.className = `stet-overlay stet-overlay--${primitive}`;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("stet-svg");
  svg.setAttribute("aria-hidden", "true");
  root.append(svg);
  document.body.append(root);
  inheritTheme(root, targets[0], runtime);

  let removeScroll: (() => void) | undefined;
  const configurePosition = () => {
    const nativeScroll = targets.every(scrollsWithDocument);
    root.style.position = nativeScroll ? "absolute" : "fixed";
    removeScroll?.();
    removeScroll =
      nativeScroll && !viewportAware && typeof IntersectionObserver !== "undefined"
        ? undefined
        : trackScroll(updateScroll);
  };

  const motion =
    typeof matchMedia === "undefined" ? null : matchMedia("(prefers-reduced-motion: reduce)");
  let destroyed = false;
  // Author intent stays separate from viewport/intersection culling: only
  // show()/replay() clear it, and culling can never restore it.
  let explicitlyHidden = options.visible === false;
  const ownedAria = new Set<AriaLink>();
  const attachAria = () => {
    for (const link of ownedAria) link.attach();
  };
  const detachAria = () => {
    for (const link of ownedAria) link.detach();
  };
  const own = (link: AriaLink) => {
    if (destroyed) {
      link.remove();
      return;
    }
    ownedAria.add(link);
    // describe() attaches on creation; a hidden annotation must not expose it.
    if (explicitlyHidden) link.detach();
  };
  // Removing an owned relationship must also drop it so a later show() cannot
  // re-attach an ID whose text node is gone.
  const disown = (link: AriaLink) => {
    ownedAria.delete(link);
    link.remove();
  };
  let descriptionNode: HTMLSpanElement | undefined;
  let descriptionLink: AriaLink | undefined;
  const syncDescription = () => {
    if (runtime.description) {
      if (!descriptionNode) {
        descriptionNode = document.createElement("span");
        descriptionNode.className = "stet-description";
        root.append(descriptionNode);
      }
      if (descriptionNode.textContent !== runtime.description)
        descriptionNode.textContent = runtime.description;
      if (!descriptionLink) {
        descriptionLink = describe(targets[targets.length - 1], descriptionNode);
        own(descriptionLink);
      }
    } else if (descriptionNode) {
      if (descriptionLink) {
        disown(descriptionLink);
        descriptionLink = undefined;
      }
      descriptionNode.remove();
      descriptionNode = undefined;
    }
  };
  syncDescription();
  const intersecting = new Map(targets.map((target) => [target, true]));

  // Clock-based reveal: progress comes from performance.now() at draw/tick time,
  // so culling, detachment, or a suspended frame loop cannot pause completion.
  // pathLength="1" normalizes every path so dashes need no getTotalLength().
  // Timing is resolved per operation so an update can only affect the next entrance.
  let animation = resolveAnimation(runtime);
  // At most one operation per handle: the delay plus reveal started by animated
  // attach, show(), or replay(). Every operation settles exactly once.
  interface Operation {
    startedAt: number;
    delay: number;
    duration: number;
    primed: boolean;
    promise: Promise<StetAnimationResult>;
    resolve: (result: StetAnimationResult) => void;
    settled: boolean;
  }
  let operation: Operation | null = null;
  let revealFrame: number | undefined;
  const clearRevealAttributes = () => {
    for (const path of Array.from(svg.querySelectorAll<SVGPathElement>("path"))) {
      path.removeAttribute("pathLength");
      path.removeAttribute("stroke-dasharray");
      path.removeAttribute("stroke-dashoffset");
    }
  };
  const setRevealProgress = (progress: number) => {
    for (const path of Array.from(svg.querySelectorAll<SVGPathElement>("path"))) {
      path.setAttribute("pathLength", "1");
      path.setAttribute("stroke-dasharray", "1");
      path.setAttribute("stroke-dashoffset", String(1 - progress));
    }
  };
  const cancelRevealFrame = () => {
    if (revealFrame !== undefined) {
      cancelAnimationFrame(revealFrame);
      revealFrame = undefined;
    }
  };
  // Null the operation before resolving so a superseding replay starts after the
  // old result is observable and a settled operation can never be re-settled.
  const settleOperation = (status: StetAnimationResult["status"]) => {
    const current = operation;
    if (!current || current.settled) return;
    current.settled = true;
    operation = null;
    current.resolve({ status });
  };
  const stopOperation = (status: StetAnimationResult["status"]) => {
    settleOperation(status);
    cancelRevealFrame();
    clearRevealAttributes();
  };
  const beginOperation = (): Promise<StetAnimationResult> => {
    let resolve!: (result: StetAnimationResult) => void;
    const promise = new Promise<StetAnimationResult>((settle) => {
      resolve = settle;
    });
    operation = {
      startedAt: performance.now(),
      delay: animation.delay,
      duration: animation.duration,
      primed: false,
      promise,
      resolve,
      settled: false,
    };
    if (svg.querySelector("path")) {
      setRevealProgress(0);
      operation.primed = true;
    }
    if (revealFrame === undefined) revealFrame = requestAnimationFrame(revealTick);
    return promise;
  };
  const applyReveal = () => {
    if (!operation) return;
    const elapsed = performance.now() - operation.startedAt - operation.delay;
    const progress =
      motion?.matches || operation.duration <= 0
        ? 1
        : !operation.primed || elapsed <= 0
          ? 0
          : Math.min(1, elapsed / operation.duration);
    operation.primed = true;
    setRevealProgress(progress);
    if (progress >= 1) stopOperation("finished");
  };
  const revealTick = () => {
    revealFrame = undefined;
    if (destroyed) return;
    applyReveal();
    if (operation) revealFrame = requestAnimationFrame(revealTick);
  };
  // Zero duration and reduced motion reach the final state without an operation.
  const startOperation = (): Promise<StetAnimationResult> | null =>
    animation.enabled &&
    strokedRevealPrimitives.has(primitive) &&
    !motion?.matches &&
    animation.duration > 0
      ? beginOperation()
      : null;

  let hasDrawn = false;
  let lastRects: DOMRect[] = [];
  const drawFrame = (force = false) => {
    if (destroyed) return;
    lastRects = targets.map((target) => target.getBoundingClientRect());
    root.hidden =
      explicitlyHidden ||
      targets.some((target, index) => {
        const rect = lastRects[index];
        return (
          !target.isConnected ||
          !target.getClientRects().length ||
          !intersecting.get(target) ||
          rect.bottom < 0 ||
          rect.right < 0 ||
          rect.top > innerHeight ||
          rect.left > innerWidth
        );
      });
    if (root.hidden && hasDrawn && !force) return;
    const next = document.createElementNS(SVG_NS, "svg");
    render(root, next, {
      rough: {
        seed,
        roughness: runtime.roughness ?? 1,
        boil: motion?.matches ? 0 : (runtime.boil ?? 0),
      },
      options: runtime,
      own,
      disown,
    });
    svg.setAttribute("viewBox", next.getAttribute("viewBox") ?? "0 0 1 1");
    if (svg.innerHTML !== next.innerHTML) svg.replaceChildren(...Array.from(next.childNodes));
    hasDrawn = true;
    applyReveal();
  };
  const draw = () => drawFrame();
  const updateScroll = () => {
    if (destroyed) return;
    // Fixed targets often do not move at all when the page scrolls.
    if (
      hasDrawn &&
      targets.every((target, index) => {
        const rect = target.getBoundingClientRect();
        const last = lastRects[index];
        return (
          target.isConnected &&
          rect.left === last.left &&
          rect.top === last.top &&
          rect.width === last.width &&
          rect.height === last.height
        );
      })
    )
      return;
    draw();
  };
  configurePosition();
  if (!explicitlyHidden) startOperation();
  draw();

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw);
  targets.forEach((target) => {
    observer?.observe(target);
    if (target.parentElement) observer?.observe(target.parentElement);
  });
  const intersection =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver((entries) => {
          for (const entry of entries) intersecting.set(entry.target, entry.isIntersecting);
          draw();
        });
  targets.forEach((target) => intersection?.observe(target));
  const resketch = (nextSeed?: number) => {
    seed = nextSeed ?? randomSeed();
    draw();
  };
  const onPointer = () => {
    if (!motion?.matches) resketch();
  };
  const bindHover = (on: boolean) => {
    targets.forEach((target) => {
      if (on) {
        target.addEventListener("pointerenter", onPointer);
        target.addEventListener("pointerdown", onPointer);
      } else {
        target.removeEventListener("pointerenter", onPointer);
        target.removeEventListener("pointerdown", onPointer);
      }
    });
  };
  let hoverBound = runtime.resketchOnHover === true;
  if (hoverBound) bindHover(true);
  const onResize = () => {
    configurePosition();
    draw();
  };
  // Reduced motion mid-operation jumps to the final visible frame and settles
  // finished; applyReveal forces progress 1 so this also works while culled.
  const onMotionChange = () => {
    if (motion?.matches && operation) applyReveal();
    draw();
  };
  window.addEventListener("resize", onResize);
  motion?.addEventListener?.("change", onMotionChange);
  document.fonts?.addEventListener("loadingdone", draw);
  void document.fonts?.ready.then(draw);

  const show = (): Promise<StetAnimationResult> => {
    if (destroyed) return Promise.resolve({ status: "cancelled" });
    // Join the in-flight operation exactly, whether it came from attach or replay.
    if (operation) return operation.promise;
    const wasHidden = explicitlyHidden;
    explicitlyHidden = false;
    attachAria();
    // Only leaving explicit hiding starts an entrance; a settled-visible show is
    // a distinct fulfilled result and must not redraw or replay.
    if (wasHidden) {
      const started = startOperation();
      draw();
      if (started) return started;
    }
    return Promise.resolve({ status: "finished" });
  };
  const hide = (): void => {
    if (destroyed || explicitlyHidden) return;
    explicitlyHidden = true;
    detachAria();
    stopOperation("cancelled");
    draw();
  };
  const replay = (): Promise<StetAnimationResult> => {
    if (destroyed) return Promise.resolve({ status: "cancelled" });
    // Replay always restores visibility/ARIA and preserves the current seed.
    explicitlyHidden = false;
    attachAria();
    // Supersede the prior operation before the replacement can settle.
    stopOperation("cancelled");
    const started = startOperation();
    draw();
    return started ?? Promise.resolve({ status: "finished" });
  };

  const update = (next: StetRuntimeOptions): void => {
    if (destroyed) return;
    // `visible` and adapter-only metadata must never enter this path.
    const { visible: _visible, onHandle: _onHandle, ...rest } = next as Record<string, unknown>;
    const normalized = rest as unknown as O;
    // Validate before any DOM or ARIA mutation.
    validate?.(normalized);
    assertRevealSupport(primitive, normalized);
    if (sameRuntimeOptions(runtime, normalized)) return;
    // A changed seed redraws at the current progress; an unchanged one keeps
    // whatever resketch() last produced.
    if (normalized.seed !== lastSeedOption) {
      seed = normalized.seed ?? randomSeed();
      lastSeedOption = normalized.seed;
    }
    runtime = normalized;
    animation = resolveAnimation(runtime);
    const hover = runtime.resketchOnHover === true;
    if (hover !== hoverBound) {
      hoverBound = hover;
      bindHover(hover);
    }
    syncDescription();
    inheritTheme(root, targets[0], runtime);
    drawFrame(true);
  };

  const handle: StetHandle & { [updateCapability]: UpdateCapability } = {
    show,
    hide,
    replay,
    resketch,
    refresh() {
      if (destroyed) return;
      inheritTheme(root, targets[0], runtime);
      configurePosition();
      draw();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      // Stop and settle any operation cancelled before tearing down.
      stopOperation("cancelled");
      for (const link of ownedAria) link.remove();
      ownedAria.clear();
      observer?.disconnect();
      intersection?.disconnect();
      bindHover(false);
      window.removeEventListener("resize", onResize);
      removeScroll?.();
      motion?.removeEventListener?.("change", onMotionChange);
      document.fonts?.removeEventListener("loadingdone", draw);
      root.remove();
    },
    [updateCapability]: { update },
  };
  return { handle, own };
}
