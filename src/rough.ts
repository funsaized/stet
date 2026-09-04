import { mulberry32 } from "./prng.js";

export interface RoughOptions {
  seed: number;
  roughness: number;
  boil?: number;
  boilSeed?: number;
}

export type Pt = [number, number];

export function sampleLine(x1: number, y1: number, x2: number, y2: number, step = 8): Pt[] {
  const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step));
  return Array.from({ length: n + 1 }, (_, i) => [
    x1 + ((x2 - x1) * i) / n,
    y1 + ((y2 - y1) * i) / n,
  ]);
}

export function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a0: number,
  a1: number,
  n: number,
): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
}

function arcPoints(cx: number, cy: number, r: number, a0: number, a1: number): Pt[] {
  return ellipsePoints(cx, cy, r, r, a0, a1, 4);
}

function roundedRectPoints(x: number, y: number, w: number, h: number, radius: number): Pt[] {
  const r = Math.min(radius, w / 2, h / 2);
  return [
    ...sampleLine(x + r, y, x + w - r, y),
    ...arcPoints(x + w - r, y + r, r, -Math.PI / 2, 0),
    ...sampleLine(x + w, y + r, x + w, y + h - r),
    ...arcPoints(x + w - r, y + h - r, r, 0, Math.PI / 2),
    ...sampleLine(x + w - r, y + h, x + r, y + h),
    ...arcPoints(x + r, y + h - r, r, Math.PI / 2, Math.PI),
    ...sampleLine(x, y + h - r, x, y + r),
    ...arcPoints(x + r, y + r, r, Math.PI, Math.PI * 1.5),
  ];
}

export function jitter(points: Pt[], rand: () => number, amplitude: number): Pt[] {
  return points.map(([x, y]) => [
    x + (rand() * 2 - 1) * amplitude,
    y + (rand() * 2 - 1) * amplitude,
  ]);
}

export function toPath(points: Pt[], close = false): string {
  if (points.length === 0) return "";
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [cx, cy] = points[i];
    const mx = (cx + points[i + 1][0]) / 2;
    const my = (cy + points[i + 1][1]) / 2;
    d += `Q${cx.toFixed(2)} ${cy.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const [lx, ly] = points[points.length - 1];
  d += `L${lx.toFixed(2)} ${ly.toFixed(2)}`;
  return close ? `${d}Z` : d;
}

function boilPass(points: Pt[], options: RoughOptions): Pt[] {
  if (!options.boil || options.boilSeed === undefined) return points;
  return jitter(points, mulberry32(options.boilSeed), options.boil);
}

function doubleStroke(points: Pt[], options: RoughOptions, close: boolean): string {
  const rand = mulberry32(options.seed);
  const amplitude = 1.5 * options.roughness;
  return (
    toPath(boilPass(jitter(points, rand, amplitude), options), close) +
    toPath(boilPass(jitter(points, rand, amplitude * 1.4), options), close)
  );
}

export function roughLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: RoughOptions,
): string {
  return doubleStroke(sampleLine(x1, y1, x2, y2), options, false);
}

export function roughEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  options: RoughOptions,
): string {
  const h = ((rx - ry) / (rx + ry)) ** 2;
  const perimeter = Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  const count = Math.max(8, Math.ceil(perimeter / 8));
  const points = ellipsePoints(cx, cy, rx, ry, 0, Math.PI * 2, count).slice(0, -1);
  return doubleStroke(points, options, true);
}

const ARROW_HEAD = 12;
const ARROW_HEAD_ANGLE = Math.PI / 6;

export function roughArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: RoughOptions,
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const wing = (delta: number): Pt => [
    x2 - ARROW_HEAD * Math.cos(angle + delta),
    y2 - ARROW_HEAD * Math.sin(angle + delta),
  ];
  const rand = mulberry32(options.seed);
  const amplitude = 1.2 * options.roughness;
  const head = ([x, y]: Pt) =>
    toPath(boilPass(jitter(sampleLine(x2, y2, x, y, 4), rand, amplitude), options));
  return (
    roughLine(x1, y1, x2, y2, options) +
    head(wing(ARROW_HEAD_ANGLE)) +
    head(wing(-ARROW_HEAD_ANGLE))
  );
}

export function roughRoundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  options: RoughOptions,
): string {
  return doubleStroke(roundedRectPoints(x, y, w, h, radius), options, true);
}

export function roughCheckmark(
  x: number,
  y: number,
  w: number,
  h: number,
  options: RoughOptions,
): string {
  const points: Pt[] = [
    ...sampleLine(x, y + h * 0.6, x + w * 0.35, y + h, 4),
    ...sampleLine(x + w * 0.35, y + h, x + w, y, 4),
  ];
  return toPath(
    boilPass(jitter(points, mulberry32(options.seed), 1.2 * options.roughness), options),
  );
}

export function scribbleFill(
  x: number,
  y: number,
  w: number,
  h: number,
  options: RoughOptions,
): string {
  const points: Pt[] = [];
  const gap = 6;
  for (let t = gap, flip = false; t < w + h; t += gap, flip = !flip) {
    const a: Pt = [x + Math.max(0, t - h), y + Math.min(t, h)];
    const b: Pt = [x + Math.min(t, w), y + Math.max(0, t - w)];
    points.push(...(flip ? [b, a] : [a, b]));
  }
  return points.length < 2
    ? ""
    : toPath(boilPass(jitter(points, mulberry32(options.seed), 1.2 * options.roughness), options));
}

export function variants(
  generate: (options: RoughOptions) => string,
  options: RoughOptions,
  count = 3,
): string[] {
  return Array.from({ length: count }, (_, i) =>
    generate({ ...options, boilSeed: options.seed + (i + 1) * 7919 }),
  );
}
