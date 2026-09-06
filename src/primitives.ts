import {
  assertElement,
  bounds,
  clientBoxes,
  createPath,
  describe,
  mount,
  place,
  type StetHandle,
  type StetOptions,
} from "./mount.js";
import { arrowGeometry, markerWash, roughArrow, roughCheckmark, roughEllipse, roughLine, roughPaper } from "./rough.js";

export type { StetHandle, StetOptions } from "./mount.js";

export interface StickyOptions extends StetOptions {
  text: string;
  side?: "auto" | "top" | "right" | "bottom" | "left";
}

export interface ArrowOptions extends StetOptions {
  label?: string;
  /** Signed bend relative to arrow length. Zero makes a straight arrow. */
  curvature?: number;
}

export type MarkKind = "right" | "wrong";

type SingleKind = "circle" | "underline" | "highlight";

function single(element: Element, kind: SingleKind, options: StetOptions = {}): StetHandle {
  assertElement(element);
  options = { ...options };
  return mount([element], kind, options, (root, svg, rough) => {
    const padding = options.padding ?? (kind === "underline" ? 3 : 5);
    const rects = clientBoxes(element, kind !== "circle");
    const outer = bounds(rects);
    place(
      root,
      svg,
      outer.left - padding,
      outer.top - padding,
      outer.width + padding * 2,
      outer.height + padding * 2,
    );

    rects.forEach((rect, index) => {
      const x = rect.left - outer.left + padding;
      const y = rect.top - outer.top + padding;
      const seeded = { ...rough, seed: rough.seed + index };
      if (kind === "circle") {
        createPath(
          svg,
          "stet-circle",
          (o) =>
            roughEllipse(
              x + rect.width / 2,
              y + rect.height / 2,
              rect.width / 2 + padding * 1.6,
              rect.height / 2 + padding,
              o,
            ),
          seeded,
        );
      } else if (kind === "underline") {
        createPath(
          svg,
          "stet-underline",
          (o) =>
            roughLine(
              x - padding / 2,
              y + rect.height + padding / 2,
              x + rect.width + padding / 2,
              y + rect.height + padding / 2,
              o,
            ),
          seeded,
        );
      } else {
        createPath(
          svg,
          "stet-highlight",
          (o) => markerWash(x - 3, y + rect.height * 0.12, rect.width + 6, rect.height * 0.82, o),
          seeded,
        );
        createPath(
          svg,
          "stet-highlight stet-highlight-edge",
          (o) => markerWash(x - 2, y + rect.height * 0.76, rect.width + 4, rect.height * 0.14, o),
          seeded,
        );
      }
    });
  });
}

export function circle(element: Element, options: StetOptions = {}): StetHandle {
  return single(element, "circle", options);
}

export function underline(element: Element, options: StetOptions = {}): StetHandle {
  return single(element, "underline", options);
}

export function highlight(element: Element, options: StetOptions = {}): StetHandle {
  return single(element, "highlight", options);
}

export function mark(element: Element, kind: MarkKind, options: StetOptions = {}): StetHandle {
  assertElement(element);
  options = { ...options };
  if (kind !== "right" && kind !== "wrong")
    throw new TypeError('stet: mark kind must be "right" or "wrong"');
  return mount([element], "mark", options, (root, svg, rough) => {
    const rect = element.getBoundingClientRect();
    const padding = options.padding ?? 4;
    place(
      root,
      svg,
      rect.left - padding,
      rect.top - padding,
      rect.width + padding * 2,
      rect.height + padding * 2,
    );
    const width = rect.width + padding;
    const height = rect.height + padding;
    if (kind === "right") {
      createPath(
        svg,
        "stet-mark stet-mark--right",
        (o) => roughCheckmark(
          rect.width < 40 ? padding + rect.width / 2 - 12.5 : rect.width + padding + 3,
          rect.width < 40 ? padding - 26 : padding - 7,
          25, 23, o,
        ),
        rough,
      );
    } else {
      createPath(
        svg,
        "stet-mark stet-mark--wrong",
        (o) => roughLine(padding / 2, padding / 2, width, height, o),
        rough,
      );
      createPath(
        svg,
        "stet-mark stet-mark--wrong",
        (o) => roughLine(width, padding / 2, padding / 2, height, { ...o, seed: o.seed + 1 }),
        rough,
      );
    }
  });
}

function insetPoint(from: DOMRect, to: DOMRect, gap: number): [number, number] {
  const x = from.left + from.width / 2;
  const y = from.top + from.height / 2;
  const dx = to.left + to.width / 2 - x;
  const dy = to.top + to.height / 2 - y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return [x, y];
  const ux = dx / distance;
  const uy = dy / distance;
  const inset =
    Math.min(
      ux ? from.width / 2 / Math.abs(ux) : Infinity,
      uy ? from.height / 2 / Math.abs(uy) : Infinity,
    ) + gap;
  return [x + ux * inset, y + uy * inset];
}

export function arrow(from: Element, to: Element, options: ArrowOptions = {}): StetHandle {
  assertElement(from, "from element");
  assertElement(to, "to element");
  options = { ...options };
  let label: HTMLSpanElement | undefined;
  const handle = mount([from, to], "arrow", options, (root, svg, rough) => {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const start = insetPoint(fromRect, toRect, 4);
    const end = insetPoint(toRect, fromRect, 4);
    const margin = 16;
    const left = Math.min(start[0], end[0]) - margin;
    const top = Math.min(start[1], end[1]) - margin;
    const width = Math.abs(end[0] - start[0]) + margin * 2;
    const height = Math.abs(end[1] - start[1]) + margin * 2;
    place(root, svg, left, top, width, height);
    createPath(
      svg,
      "stet-arrow",
      (o) => roughArrow(start[0] - left, start[1] - top, end[0] - left, end[1] - top, o, options.curvature),
      rough,
    );
    if (options.label) {
      label ??= document.createElement("span");
      label.className = "stet-label";
      label.textContent = options.label;
      const { midpoint } = arrowGeometry(...start, ...end, options.curvature);
      root.append(label);
      const halfWidth = label.offsetWidth / 2, halfHeight = label.offsetHeight / 2;
      const vertical = Math.abs(end[1] - start[1]) > Math.abs(end[0] - start[0]);
      let x = midpoint[0] + (vertical ? halfWidth + 8 : 0);
      let y = midpoint[1] - (vertical ? 0 : halfHeight + 8);
      const overlaps = (r: DOMRect) => x + halfWidth > r.left && x - halfWidth < r.right &&
        y + halfHeight > r.top && y - halfHeight < r.bottom;
      if (overlaps(fromRect) || overlaps(toRect)) {
        if (vertical) {
          x = Math.max(fromRect.right, toRect.right) + halfWidth + 8;
          if (innerWidth - Math.max(fromRect.right, toRect.right) < Math.min(fromRect.left, toRect.left))
            x = Math.min(fromRect.left, toRect.left) - halfWidth - 8;
        } else y = Math.min(fromRect.top, toRect.top) - halfHeight - 8;
      }
      x = Math.max(halfWidth + 8, Math.min(x, innerWidth - halfWidth - 8));
      y = Math.max(halfHeight + 8, Math.min(y, innerHeight - halfHeight - 8));
      label.style.left = `${x - left}px`;
      label.style.top = `${y - top}px`;
    }
  }, Boolean(options.label));
  const removeDescription = label ? describe(to, label) : undefined;
  return {
    resketch: handle.resketch,
    refresh: handle.refresh,
    destroy() {
      removeDescription?.();
      handle.destroy();
    },
  };
}

function stickySide(
  rect: DOMRect,
  requested: StickyOptions["side"],
  width: number,
  height: number,
  gap: number,
): Exclude<StickyOptions["side"], "auto" | undefined> {
  const room = {
    right: innerWidth - rect.right - width - gap - 12,
    bottom: innerHeight - rect.bottom - height - gap - 12,
    left: rect.left - width - gap - 12,
    top: rect.top - height - gap - 12,
  };
  if (requested && requested !== "auto" && room[requested] >= 0) return requested;
  const sides = ["right", "bottom", "left", "top"] as const;
  return sides.find((side) => room[side] >= 0) ??
    sides.reduce((best, side) => room[side] > room[best] ? side : best);
}

export function sticky(element: Element, options: StickyOptions): StetHandle {
  assertElement(element);
  if (!options || typeof options.text !== "string")
    throw new TypeError("stet: sticky text is required");
  options = { ...options };
  let text: HTMLSpanElement | undefined;
  const handle = mount([element], "sticky", options, (root, svg, rough) => {
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, Math.min(176, innerWidth - 24));
    text ??= document.createElement("span");
    text.className = "stet-sticky-text";
    if (text.textContent !== options.text) text.textContent = options.text;
    root.style.width = `${width}px`;
    root.append(text);
    const height = Math.max(88, text.offsetHeight + 30);
    const gap = options.padding ?? 14;
    const side = stickySide(rect, options.side, width, height, gap);
    let left =
      side === "left"
        ? rect.left - width - gap
        : side === "right"
          ? rect.right + gap
          : rect.left + (rect.width - width) / 2;
    let top =
      side === "top"
        ? rect.top - height - gap
        : side === "bottom"
          ? rect.bottom + gap
          : rect.top + (rect.height - height) / 2;
    left = Math.max(12, Math.min(left, innerWidth - width - 12));
    top = Math.max(12, Math.min(top, innerHeight - height - 12));
    place(root, svg, left, top, width, height);
    createPath(
      svg,
      "stet-sticky-paper",
      (o) => roughPaper(3, 3, width - 6, height - 6, o),
      rough,
    );
  }, true);
  const removeDescription = describe(element, text!);
  return {
    resketch: handle.resketch,
    refresh: handle.refresh,
    destroy() {
      removeDescription();
      handle.destroy();
    },
  };
}
