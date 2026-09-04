import type { Directive } from "vue";
import {
  arrow as attachArrow,
  circle as attachCircle,
  highlight as attachHighlight,
  mark as attachMark,
  sticky as attachSticky,
  underline as attachUnderline,
  type ArrowOptions,
  type MarkKind,
  type StetHandle,
  type StetOptions,
  type StickyOptions,
} from "./index.js";

function directive<T>(
  attach: (element: Element, value: T) => StetHandle,
): Directive<HTMLElement, T> {
  const handles = new WeakMap<Element, StetHandle>();
  const mount = (element: Element, value: T) => handles.set(element, attach(element, value));
  return {
    mounted: (element, binding) => mount(element, binding.value),
    updated(element, binding) {
      if (sameOptions(binding.value, binding.oldValue)) return;
      handles.get(element)?.destroy();
      mount(element, binding.value);
    },
    unmounted(element) {
      handles.get(element)?.destroy();
      handles.delete(element);
    },
  };
}

function sameOptions(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Reflect.get(a, key) === Reflect.get(b, key))
  );
}

export const vStetCircle = directive<StetOptions>((element, options = {}) =>
  attachCircle(element, options),
);
export const vStetUnderline = directive<StetOptions>((element, options = {}) =>
  attachUnderline(element, options),
);
export const vStetHighlight = directive<StetOptions>((element, options = {}) =>
  attachHighlight(element, options),
);
export const vStetSticky = directive<StickyOptions>((element, options) =>
  attachSticky(element, options),
);
export const vStetMark = directive<StetOptions & { kind: MarkKind }>(
  (element, { kind, ...options }) => attachMark(element, kind, options),
);
export const vStetArrow = directive<ArrowOptions & { to: Element }>((element, { to, ...options }) =>
  attachArrow(element, to, options),
);
