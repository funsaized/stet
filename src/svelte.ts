import type { Action } from "svelte/action";
import {
  arrow as attachArrow,
  box as attachBox,
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
import { updateHandle, type StetRuntimeOptions } from "./mount.js";

type OnHandle = (handle: StetHandle | null) => void;

/** Adapter-only metadata the action strips before any runtime use. */
type AdapterMeta = { visible?: boolean; onHandle?: OnHandle };

/** Last reconciled state for one action instance. */
interface Mounted {
  elements: (Element | null)[];
  handle: StetHandle | null;
  /** Complete non-visible runtime snapshot with adapter metadata stripped. */
  options: Record<string, unknown>;
  visible: boolean;
  /** The callback that received the live handle; it alone receives the null. */
  owner: OnHandle | undefined;
}

interface Adapter<T extends AdapterMeta> {
  /** Complete runtime snapshot excluding visibility and adapter metadata. */
  snapshot(value: T): Record<string, unknown>;
  /** Action host plus any required destination; null entries are unresolved. */
  targets(element: Element, value: T): (Element | null)[];
  attach(targets: Element[], options: StetRuntimeOptions): StetHandle;
}

/** Every runtime key, present even when undefined, so dropped values reset. */
const sharedKeys: readonly (keyof StetOptions)[] = [
  "seed",
  "roughness",
  "boil",
  "stroke",
  "fill",
  "width",
  "resketchOnHover",
  "padding",
  "description",
  "animate",
  "animationDuration",
  "animationDelay",
];

function sharedOptions(value: StetOptions): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  for (const key of sharedKeys) options[key] = value[key];
  return options;
}

function sameOptions(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return Object.keys(a).every((key) => a[key] === b[key]);
}

/**
 * Shared lifecycle for every Svelte primitive: target replacement, then
 * nonreplaying updates, then changed-only visibility, then callback transfer.
 * Svelte calls the action once per host, so the closure holds per-instance state.
 */
function action<T extends AdapterMeta>(adapter: Adapter<T>): Action<HTMLElement, T | undefined> {
  // Svelte's Action parameter is a conditional tuple that TypeScript cannot
  // match against a concrete implementation, so implement plainly and cast once.
  return ((element: HTMLElement, initial?: T) => {
    let current: Mounted | null = null;

    const reconcile = (value: T | undefined) => {
      const parameter = (value ?? {}) as T;
      const elements = adapter.targets(element, parameter);
      const options = adapter.snapshot(parameter);
      const visible = parameter.visible ?? true;
      const onHandle = parameter.onHandle;
      const missing = elements.some((target) => target === null);
      const previous = current;

      // No live handle: a missing target is a silent no-op; otherwise attach and
      // deliver the handle to the current callback without a preceding null.
      if (!previous || !previous.handle) {
        if (missing) return;
        const handle = adapter.attach(elements as Element[], { ...options, visible });
        // Commit adapter state before invoking user callbacks.
        current = { elements, handle, options, visible, owner: onHandle };
        onHandle?.(handle);
        return;
      }

      const replaced =
        elements.length !== previous.elements.length ||
        elements.some((target, index) => target !== previous.elements[index]);

      // Destroy first, send null to the owning callback, then reattach only if
      // all targets exist. A throwing outgoing callback is surfaced after the
      // replacement commits, so it cannot abort a valid reattach.
      if (missing || replaced) {
        const owner = previous.owner;
        previous.handle.destroy();
        current = { elements, handle: null, options, visible, owner: undefined };
        let outgoing: unknown;
        let failed = false;
        try {
          owner?.(null);
        } catch (error) {
          failed = true;
          outgoing = error;
        }
        if (!missing) {
          const handle = adapter.attach(elements as Element[], { ...options, visible });
          current = { elements, handle, options, visible, owner: onHandle };
          onHandle?.(handle);
        }
        if (failed) throw outgoing;
        return;
      }

      // Same targets and live handle: update nonreplaying runtime data in place.
      if (!sameOptions(options, previous.options)) {
        updateHandle(previous.handle, options);
        previous.options = options;
      }

      // Declarative visibility only acts on a change from the last declarative
      // value, so an unrelated update cannot undo an imperative show/hide.
      if (visible !== previous.visible) {
        previous.visible = visible;
        if (visible) void previous.handle.show();
        else previous.handle.hide();
      }

      // Transfer without update, remount, or replay; `finally` still notifies
      // the new owner when the outgoing callback throws.
      if (onHandle !== previous.owner) {
        const owner = previous.owner;
        previous.owner = onHandle;
        try {
          owner?.(null);
        } finally {
          onHandle?.(previous.handle);
        }
      }
    };

    reconcile(initial);

    return {
      update(value: T | undefined) {
        reconcile(value);
      },
      destroy() {
        const previous = current;
        current = null;
        if (!previous?.handle) return;
        const owner = previous.owner;
        previous.handle.destroy();
        owner?.(null);
      },
    };
  }) as Action<HTMLElement, T | undefined>;
}

export const circle: Action<HTMLElement, (StetOptions & AdapterMeta) | undefined> = action<
  StetOptions & AdapterMeta
>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachCircle(element, options as StetOptions),
});

export const box: Action<HTMLElement, (StetOptions & AdapterMeta) | undefined> = action<
  StetOptions & AdapterMeta
>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachBox(element, options as StetOptions),
});

export const underline: Action<HTMLElement, (StetOptions & AdapterMeta) | undefined> = action<
  StetOptions & AdapterMeta
>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachUnderline(element, options as StetOptions),
});

export const highlight: Action<HTMLElement, (StetOptions & AdapterMeta) | undefined> = action<
  StetOptions & AdapterMeta
>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachHighlight(element, options as StetOptions),
});

export const sticky: Action<HTMLElement, StickyOptions & AdapterMeta> = action<
  StickyOptions & AdapterMeta
>({
  snapshot: (value) => ({
    ...sharedOptions(value),
    text: value.text,
    side: value.side,
    offsetX: value.offsetX,
    offsetY: value.offsetY,
  }),
  targets: (element) => [element],
  attach: ([element], options) => attachSticky(element, options as StickyOptions),
});

export const mark: Action<HTMLElement, StetOptions & { kind: MarkKind } & AdapterMeta> = action<
  StetOptions & { kind: MarkKind } & AdapterMeta
>({
  snapshot: (value) => ({ ...sharedOptions(value), kind: value.kind }),
  targets: (element) => [element],
  attach: ([element], options) => {
    const { kind, ...rest } = options as StetOptions & { kind: MarkKind };
    return attachMark(element, kind, rest);
  },
});

export const arrow: Action<HTMLElement, ArrowOptions & { to?: Element | null } & AdapterMeta> =
  action<ArrowOptions & { to?: Element | null } & AdapterMeta>({
    snapshot: (value) => ({
      ...sharedOptions(value),
      label: value.label,
      curvature: value.curvature,
      labelOffsetX: value.labelOffsetX,
      labelOffsetY: value.labelOffsetY,
    }),
    // An absent destination is as unresolved as a null one: never pass either to
    // the primitive, and wait silently until an Element appears.
    targets: (element, value) => [element, value.to ?? null],
    attach: ([element, to], options) => attachArrow(element, to, options as ArrowOptions),
  });
