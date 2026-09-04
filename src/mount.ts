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
}

export interface StetHandle {
  resketch(seed?: number): void;
  destroy(): void;
}

export interface Renderer {
  (root: HTMLDivElement, svg: SVGSVGElement, options: RoughOptions): void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

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
  root.style.left = `${left}px`;
  root.style.top = `${top}px`;
  root.style.width = `${w}px`;
  root.style.height = `${h}px`;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
}

export function clientBoxes(element: Element): DOMRect[] {
  const rects = Array.from(element.getClientRects()).filter((rect) => rect.width || rect.height);
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

function reducedMotion(): boolean {
  return (
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function mount(
  targets: Element[],
  primitive: string,
  options: StetOptions,
  render: Renderer,
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
  applyTheme(root, options);

  const motionReduced = reducedMotion();
  let seed = options.seed ?? randomSeed();
  const draw = () => {
    const next = document.createElementNS(SVG_NS, "svg");
    render(root, next, {
      seed,
      roughness: options.roughness ?? 1,
      boil: motionReduced ? 0 : (options.boil ?? 0.3),
    });
    svg.setAttribute("viewBox", next.getAttribute("viewBox") ?? "0 0 1 1");
    if (svg.innerHTML !== next.innerHTML) svg.replaceChildren(...Array.from(next.childNodes));
  };
  draw();

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(draw);
  targets.forEach((target) => {
    observer?.observe(target);
    if (target.parentElement) observer?.observe(target.parentElement);
  });
  const resketch = (nextSeed?: number) => {
    seed = nextSeed ?? randomSeed();
    draw();
  };
  const onPointer = () => resketch();
  if ((options.resketchOnHover ?? true) && !motionReduced) {
    targets.forEach((target) => {
      target.addEventListener("pointerenter", onPointer);
      target.addEventListener("pointerdown", onPointer);
    });
  }
  window.addEventListener("resize", draw);
  window.addEventListener("scroll", draw, true);

  return {
    resketch,
    destroy() {
      observer?.disconnect();
      targets.forEach((target) => {
        target.removeEventListener("pointerenter", onPointer);
        target.removeEventListener("pointerdown", onPointer);
      });
      window.removeEventListener("resize", draw);
      window.removeEventListener("scroll", draw, true);
      root.remove();
    },
  };
}
