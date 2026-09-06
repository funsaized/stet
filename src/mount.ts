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
  /** Accessible meaning for an otherwise decorative mark. */
  description?: string;
}

export interface StetHandle {
  resketch(seed?: number): void;
  /** Follow a layout change without changing the drawing's seed. */
  refresh(): void;
  destroy(): void;
}

export interface Renderer {
  (root: HTMLDivElement, svg: SVGSVGElement, options: RoughOptions): void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

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
  if (!scrollUpdates.size) window.addEventListener("scroll", onScroll, { capture: true, passive: true });
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
    if (node !== target && node !== document.body && node !== document.documentElement &&
      /auto|scroll|hidden|overlay/.test(`${style.overflowX} ${style.overflowY}`)) return false;
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
  if (text && element.matches("p,h1,h2,h3,h4,h5,h6,blockquote,li,span,a,strong,em,b,i,small,code,label") && element.textContent?.trim()) {
    const range = document.createRange();
    range.selectNodeContents(element);
    source = range.getClientRects();
  }
  const rects: DOMRect[] = [];
  for (const rect of Array.from(source).filter((r) => r.width && r.height)) {
    const line = rects.findIndex((r) => {
      const overlap = Math.min(r.bottom, rect.bottom) - Math.max(r.top, rect.top);
      return overlap > Math.min(r.height, rect.height) * 0.6 &&
        Math.max(r.height, rect.height) < Math.min(r.height, rect.height) * 1.8;
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
  if (options.fill) root.style.setProperty("--stet-local-fill", options.fill);
  if (options.width !== undefined) root.style.setProperty("--stet-width", String(options.width));
}

const themeTokens = ["stroke", "fill", "paper", "width", "correct", "wrong", "note", "font", "z-index", "highlight-blend"];

function inheritTheme(root: HTMLElement, target: Element, options: StetOptions): void {
  const style = getComputedStyle(target);
  const inherited = getComputedStyle(document.body);
  for (const token of themeTokens) {
    const property = `--stet-${token}`;
    const value = style.getPropertyValue(property);
    if (value && value !== inherited.getPropertyValue(property)) root.style.setProperty(property, value);
    else root.style.removeProperty(property);
  }
  applyTheme(root, options);
}

let descriptionId = 0;

export function describe(element: Element, text: HTMLElement): () => void {
  let id: string;
  do { id = `stet-description-${++descriptionId}`; } while (document.getElementById(id));
  text.id = id;
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  element.setAttribute("aria-describedby", [...ids, text.id].join(" "));
  return () => {
    const remaining = (element.getAttribute("aria-describedby")?.split(/\s+/) ?? []).filter((id) => id && id !== text.id);
    if (remaining.length) element.setAttribute("aria-describedby", remaining.join(" "));
    else element.removeAttribute("aria-describedby");
  };
}

export function mount(
  targets: Element[],
  primitive: string,
  options: StetOptions,
  render: Renderer,
  viewportAware = false,
): StetHandle {
  targets.forEach((target, index) =>
    assertElement(target, index ? `element ${index + 1}` : "element"),
  );
  if (!document.body) throw new Error("stet: document.body is required");

  const root = document.createElement("div");
  root.className = `stet-overlay stet-overlay--${primitive}`;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.classList.add("stet-svg");
  svg.setAttribute("aria-hidden", "true");
  root.append(svg);
  document.body.append(root);
  inheritTheme(root, targets[0], options);

  let removeScroll: (() => void) | undefined;
  const configurePosition = () => {
    const nativeScroll = targets.every(scrollsWithDocument);
    root.style.position = nativeScroll ? "absolute" : "fixed";
    removeScroll?.();
    removeScroll = nativeScroll && !viewportAware && typeof IntersectionObserver !== "undefined" ? undefined : trackScroll(updateScroll);
  };

  const motion = typeof matchMedia === "undefined" ? null : matchMedia("(prefers-reduced-motion: reduce)");
  let destroyed = false;
  let removeDescription: (() => void) | undefined;
  if (options.description) {
    const text = document.createElement("span");
    text.className = "stet-description";
    text.textContent = options.description;
    root.append(text);
    removeDescription = describe(targets[targets.length - 1], text);
  }
  let seed = options.seed ?? randomSeed();
  const visible = new Map(targets.map((target) => [target, true]));
  let hasDrawn = false;
  let lastRects: DOMRect[] = [];
  const draw = () => {
    if (destroyed) return;
    lastRects = targets.map((target) => target.getBoundingClientRect());
    root.hidden = targets.some((target, index) => {
      const rect = lastRects[index];
      return !target.isConnected || !target.getClientRects().length || !visible.get(target) ||
        rect.bottom < 0 || rect.right < 0 || rect.top > innerHeight || rect.left > innerWidth;
    });
    if (root.hidden && hasDrawn) return;
    const next = document.createElementNS(SVG_NS, "svg");
    render(root, next, {
      seed,
      roughness: options.roughness ?? 1,
      boil: motion?.matches ? 0 : (options.boil ?? 0),
    });
    svg.setAttribute("viewBox", next.getAttribute("viewBox") ?? "0 0 1 1");
    if (svg.innerHTML !== next.innerHTML) svg.replaceChildren(...Array.from(next.childNodes));
    hasDrawn = true;
  };
  const updateScroll = () => {
    if (destroyed) return;
    // Fixed targets often do not move at all when the page scrolls.
    if (hasDrawn && targets.every((target, index) => {
      const rect = target.getBoundingClientRect();
      const last = lastRects[index];
      return target.isConnected && rect.left === last.left && rect.top === last.top &&
        rect.width === last.width && rect.height === last.height;
    })) return;
    draw();
  };
  configurePosition();
  draw();

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw);
  targets.forEach((target) => {
    observer?.observe(target);
    if (target.parentElement) observer?.observe(target.parentElement);
  });
  const intersection = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
    draw();
  });
  targets.forEach((target) => intersection?.observe(target));
  const resketch = (nextSeed?: number) => {
    seed = nextSeed ?? randomSeed();
    draw();
  };
  const onPointer = () => { if (!motion?.matches) resketch(); };
  if (options.resketchOnHover) {
    targets.forEach((target) => {
      target.addEventListener("pointerenter", onPointer);
      target.addEventListener("pointerdown", onPointer);
    });
  }
  const onResize = () => { configurePosition(); draw(); };
  window.addEventListener("resize", onResize);
  motion?.addEventListener?.("change", draw);
  document.fonts?.addEventListener("loadingdone", draw);
  void document.fonts?.ready.then(draw);

  return {
    resketch,
    refresh() {
      if (destroyed) return;
      inheritTheme(root, targets[0], options);
      configurePosition();
      draw();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      removeDescription?.();
      observer?.disconnect();
      intersection?.disconnect();
      targets.forEach((target) => {
        target.removeEventListener("pointerenter", onPointer);
        target.removeEventListener("pointerdown", onPointer);
      });
      window.removeEventListener("resize", onResize);
      removeScroll?.();
      motion?.removeEventListener?.("change", draw);
      document.fonts?.removeEventListener("loadingdone", draw);
      root.remove();
    },
  };
}
