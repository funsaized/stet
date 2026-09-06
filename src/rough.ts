import { mulberry32 } from "./prng.js";

export interface RoughOptions {
  seed: number;
  roughness: number;
  boil?: number;
  boilSeed?: number;
}

export type Pt = [number, number];
const point = ([x, y]: Pt) => `${x.toFixed(2)} ${y.toFixed(2)}`;

// Long gestures avoid high-frequency wobble.
function pen(options: RoughOptions): () => number {
  const random = mulberry32(options.seed);
  const frame = mulberry32(options.boilSeed ?? options.seed);
  return () => (random() * 2 - 1) * options.roughness +
    (frame() * 2 - 1) * (options.boil ?? 0);
}

export function roughLine(x1: number, y1: number, x2: number, y2: number, options: RoughOptions): string {
  const random = pen(options);
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const bow = Math.min(7, length * 0.035);
  const at = (t: number, offset: number): Pt => [x1 + dx * t - dy / length * offset, y1 + dy * t + dx / length * offset];
  return `M${point(at(0, random() * 0.6))}C${point(at(0.3, bow * (0.5 + random())))} ${point(at(0.72, bow * (0.5 + random())))} ${point(at(1, random() * 0.8))}`;
}

// Catmull–Rom interpolation preserves the gesture through the sampled points.
function curve(points: Pt[]): string {
  let d = `M${point(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)], b = points[i];
    const c = points[i + 1], e = points[Math.min(points.length - 1, i + 2)];
    d += `C${point([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${point([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${point(c)}`;
  }
  return d;
}

export function roughEllipse(cx: number, cy: number, rx: number, ry: number, options: RoughOptions): string {
  const random = pen(options);
  const phase = random() * Math.PI;
  const lean = random() * Math.min(6, ry * 0.18);
  const wobble = Math.min(rx * 0.1, ry * 0.1, 2.5);
  // Flatter shoulders on wide controls leave room for their corners.
  const power = Math.max(0.62, 1 - Math.abs(Math.log((rx || 1) / (ry || 1))) * 0.16);
  const start = -Math.PI * 0.7 + random() * 0.15;
  const points: Pt[] = Array.from({ length: 37 }, (_, i) => {
    const t = i / 36, a = start + (Math.PI * 2 + 0.22) * t;
    const c = Math.cos(a), s = Math.sin(a);
    const drift = (Math.sin(2 * a + phase) + Math.sin(3 * a - phase) * 0.4) * wobble * options.roughness;
    // Leave an open finishing overlap.
    const finish = Math.max(0, (t - 0.88) / 0.12) * 1.4 * options.roughness;
    return [cx + Math.sign(c) * Math.abs(c) ** power * (rx + drift) + lean * s,
      cy + Math.sign(s) * Math.abs(s) ** power * (ry + drift * 0.65) + c * lean * 0.55 + finish];
  });
  return curve(points);
}

export function arrowGeometry(x1: number, y1: number, x2: number, y2: number, curvature = 0.16) {
  const dx = x2 - x1, dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const bend = Math.max(-0.8, Math.min(0.8, curvature)) * Math.min(length, 240);
  const control: Pt = [(x1 + x2) / 2 - dy / length * bend, (y1 + y2) / 2 + dx / length * bend];
  return { control, midpoint: [(x1 + x2) / 4 + control[0] / 2, (y1 + y2) / 4 + control[1] / 2] as Pt };
}

export function roughArrow(x1: number, y1: number, x2: number, y2: number, options: RoughOptions, curvature = 0.16): string {
  const random = pen(options);
  const { control } = arrowGeometry(x1, y1, x2, y2, curvature);
  control[0] += random() * 2;
  control[1] += random() * 2;
  const angle = Math.atan2(y2 - control[1], x2 - control[0]);
  const size = Math.min(13, Math.hypot(x2 - x1, y2 - y1) * 0.3);
  const wing = (delta: number, scale: number): Pt => [x2 - size * scale * Math.cos(angle + delta), y2 - size * scale * Math.sin(angle + delta)];
  const a = wing(0.5, 1), b = wing(-0.43, 0.86);
  return `M${point([x1, y1])}Q${point(control)} ${point([x2, y2])}` +
    `M${point(a)}Q${point([(a[0] + x2) / 2 + random() * 0.6, (a[1] + y2) / 2])} ${point([x2, y2])}L${point(b)}`;
}

export function roughCheckmark(x: number, y: number, w: number, h: number, options: RoughOptions): string {
  const random = pen(options);
  return `M${point([x, y + h * 0.53])}Q${point([x + w * 0.17, y + h * 0.68 + random()])} ${point([x + w * 0.3, y + h * 0.92])}` +
    `Q${point([x + w * 0.65 + random(), y + h * 0.3])} ${point([x + w, y])}`;
}

// A chisel nib leaves slanted ends and broad, slowly changing edges.
export function markerWash(x: number, y: number, w: number, h: number, options: RoughOptions): string {
  const random = pen(options);
  const edge = Math.min(1.6, h * 0.09);
  const slant = Math.min(4, w * 0.08, h * 0.22);
  return `M${point([x + slant, y + random() * edge])}` +
    `C${point([x + w * 0.32, y + random() * edge])} ${point([x + w * 0.7, y + random() * edge])} ${point([x + w, y + random() * edge])}` +
    `L${point([x + w - slant, y + h])}` +
    `C${point([x + w * 0.66, y + h + random() * edge])} ${point([x + w * 0.25, y + h + random() * edge])} ${point([x, y + h + random() * edge])}Z`;
}

export function roughPaper(x: number, y: number, w: number, h: number, options: RoughOptions): string {
  const random = pen(options);
  return `M${point([x, y + 1])}Q${point([x + w * 0.5, y + random()])} ${point([x + w, y])}` +
    `L${point([x + w - 1, y + h - 5])}Q${point([x + w * 0.6, y + h + 2 + random()])} ${point([x + 1, y + h])}Z`;
}

export function variants(generate: (options: RoughOptions) => string, options: RoughOptions, count = 3): string[] {
  return Array.from({ length: count }, (_, i) => generate({ ...options, boilSeed: options.seed + (i + 1) * 7919 }));
}
