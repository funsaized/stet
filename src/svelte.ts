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

export interface ActionReturn<T> {
  update(options: T): void;
  destroy(): void;
}

function action<T>(attach: (element: Element, options: T) => StetHandle) {
  return (element: Element, initial: T): ActionReturn<T> => {
    let handle = attach(element, initial);
    let previous = snapshot(initial);
    return {
      update(options) {
        if (sameOptions(options, previous)) return;
        handle.destroy();
        handle = attach(element, options);
        previous = snapshot(options);
      },
      destroy: () => handle.destroy(),
    };
  };
}

function snapshot<T>(value: T): T {
  return value && typeof value === "object" ? { ...value } : value;
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

function optionalAction(attach: (element: Element, options: StetOptions) => StetHandle) {
  const run = action(attach);
  return (element: Element, options: StetOptions = {}) => run(element, options);
}

export const circle = optionalAction(attachCircle);
export const underline = optionalAction(attachUnderline);
export const highlight = optionalAction(attachHighlight);
export const sticky = action<StickyOptions>(attachSticky);
export const mark = action<StetOptions & { kind: MarkKind }>((element, { kind, ...options }) =>
  attachMark(element, kind, options),
);
export const arrow = action<ArrowOptions & { to: Element }>((element, { to, ...options }) =>
  attachArrow(element, to, options),
);
