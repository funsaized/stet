import {
  assertElement,
  bounds,
  clientBoxes,
  createPath,
  mount,
  place,
  type StetHandle,
  type StetOptions,
} from "./mount.js";
import { roughArrow, roughCheckmark, roughEllipse, roughLine, roughRoundedRect } from "./rough.js";

export type { StetHandle, StetOptions } from "./mount.js";

export interface StickyOptions extends StetOptions {
  text: string;
  side?: "auto" | "top" | "right" | "bottom" | "left";
}

export interface ArrowOptions extends StetOptions {
  label?: string;
}

export type MarkKind = "right" | "wrong";

type SingleKind = "circle" | "underline" | "highlight";

function single(element: Element, kind: SingleKind, options: StetOptions = {}): StetHandle {
  assertElement(element);
  return mount([element], kind, options, (root, svg, rough) => {
    const padding = options.padding ?? (kind === "underline" ? 3 : 5);
    const rects = clientBoxes(element);
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
              rect.width / 2 + padding / 2,
              rect.height / 2 + padding / 2,
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
          (o) => roughRoundedRect(x - 2, y, rect.width + 4, rect.height, 4, o),
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
        (o) => roughCheckmark(padding / 2, padding / 2, width, height, o),
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
  const distance = Math.hypot(dx, dy) || 1;
  const ux = dx / distance;
  const uy = dy / distance;
  const inset =
    Math.min(
      ux ? from.width / 2 / Math.abs(ux) : Infinity,
      uy ? from.height / 2 / Math.abs(uy) : Infinity,
    ) + gap;
  return [x + ux * inset, y + uy * inset];
}

let descriptionId = 0;

function describe(element: Element, text: HTMLElement): () => void {
  const id = `stet-description-${++descriptionId}`;
  text.id = id;
  const ids = element.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
  element.setAttribute("aria-describedby", [...ids, id].join(" "));
  return () => {
    const remaining = (element.getAttribute("aria-describedby")?.split(/\s+/) ?? []).filter(
      (value) => value && value !== id,
    );
    if (remaining.length) element.setAttribute("aria-describedby", remaining.join(" "));
    else element.removeAttribute("aria-describedby");
  };
}

export function arrow(from: Element, to: Element, options: ArrowOptions = {}): StetHandle {
  assertElement(from, "from element");
  assertElement(to, "to element");
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
      (o) => roughArrow(start[0] - left, start[1] - top, end[0] - left, end[1] - top, o),
      rough,
    );
    if (options.label) {
      label ??= document.createElement("span");
      label.className = "stet-label";
      label.textContent = options.label;
      label.style.left = `${(start[0] + end[0]) / 2 - left}px`;
      label.style.top = `${(start[1] + end[1]) / 2 - top}px`;
      root.append(label);
    }
  });
  const removeDescription = label ? describe(to, label) : undefined;
  return {
    resketch: handle.resketch,
    destroy() {
      removeDescription?.();
      handle.destroy();
    },
  };
}

function stickySide(
  rect: DOMRect,
  requested: StickyOptions["side"],
): Exclude<StickyOptions["side"], "auto" | undefined> {
  if (requested && requested !== "auto") return requested;
  const width = 160;
  const height = 88;
  if (innerWidth - rect.right >= width) return "right";
  if (innerHeight - rect.bottom >= height) return "bottom";
  if (rect.left >= width) return "left";
  return "top";
}

export function sticky(element: Element, options: StickyOptions): StetHandle {
  assertElement(element);
  if (!options || typeof options.text !== "string")
    throw new TypeError("stet: sticky text is required");
  let text: HTMLSpanElement | undefined;
  const handle = mount([element], "sticky", options, (root, svg, rough) => {
    const rect = element.getBoundingClientRect();
    const side = stickySide(rect, options.side);
    const width = 160;
    const height = 88;
    const gap = options.padding ?? 10;
    const left =
      side === "left"
        ? rect.left - width - gap
        : side === "right"
          ? rect.right + gap
          : rect.left + (rect.width - width) / 2;
    const top =
      side === "top"
        ? rect.top - height - gap
        : side === "bottom"
          ? rect.bottom + gap
          : rect.top + (rect.height - height) / 2;
    place(root, svg, left, top, width, height);
    createPath(
      svg,
      "stet-sticky-paper",
      (o) => roughRoundedRect(3, 3, width - 6, height - 6, 8, o),
      rough,
    );
    text ??= document.createElement("span");
    text.className = "stet-sticky-text";
    text.textContent = options.text;
    root.append(text);
  });
  const removeDescription = describe(element, text!);
  return {
    resketch: handle.resketch,
    destroy() {
      removeDescription();
      handle.destroy();
    },
  };
}
