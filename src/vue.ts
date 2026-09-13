import type { Directive, DirectiveBinding } from "vue";
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

/** Adapter-only metadata the directive strips before any runtime use. */
type AdapterMeta = { visible?: boolean; onHandle?: OnHandle };

/** Last reconciled state for one directive host. */
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
  /** Required targets; null entries are unresolved. */
  targets(element: Element, value: T): (Element | null)[];
  attach(targets: Element[], options: StetRuntimeOptions): StetHandle;
}

/**
 * Complete non-visible runtime snapshot. Every known field is present so a
 * later update that drops a value resets it to its default through
 * updateHandle. `visible`, `onHandle`, and adapter targets never enter it.
 */
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
 * Shared directive lifecycle for every Vue primitive. Applies the adapter
 * contract's ordered algorithm on each hook: target replacement first, then
 * nonreplaying updates, then changed-only visibility, then callback transfer.
 *
 * Directive state is keyed by the host element, so Vue's own host replacement
 * arrives as unmounted-then-mounted and follows the destroy/null/attach rules
 * without a special case here.
 */
function directive<T extends AdapterMeta>(adapter: Adapter<T>): Directive<HTMLElement, T> {
  const mounted = new WeakMap<Element, Mounted>();

  const reconcile = (element: Element, binding: DirectiveBinding<T>) => {
    const value = (binding.value ?? {}) as T;
    const elements = adapter.targets(element, value);
    const options = adapter.snapshot(value);
    const visible = value.visible ?? true;
    const onHandle = value.onHandle;
    const missing = elements.some((target) => target === null);
    const previous = mounted.get(element);

    // No live handle: a missing target is a silent no-op; otherwise attach and
    // deliver the handle to the current callback without a preceding null.
    if (!previous || !previous.handle) {
      if (missing) return;
      const handle = adapter.attach(elements as Element[], { ...options, visible });
      // Commit adapter state before invoking user callbacks.
      mounted.set(element, { elements, handle, options, visible, owner: onHandle });
      onHandle?.(handle);
      return;
    }

    const replaced =
      elements.length !== previous.elements.length ||
      elements.some((target, index) => target !== previous.elements[index]);

    // Target replacement or a missing target destroys first, sends null to the
    // callback that owned the handle, then reattaches only if all targets exist.
    // A throwing outgoing callback is surfaced but must not abort a valid
    // replacement, so its failure is captured until the new handle is committed.
    if (missing || replaced) {
      const owner = previous.owner;
      previous.handle.destroy();
      mounted.set(element, { elements, handle: null, options, visible, owner: undefined });
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
        mounted.set(element, { elements, handle, options, visible, owner: onHandle });
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

    // Transfer the callback without update, remount, or replay. `finally`
    // notifies the new owner even when the outgoing callback throws.
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

  return {
    deep: true,
    mounted: (element, binding) => reconcile(element, binding),
    updated: (element, binding) => reconcile(element, binding),
    unmounted(element) {
      const current = mounted.get(element);
      mounted.delete(element);
      if (!current?.handle) return;
      const owner = current.owner;
      current.handle.destroy();
      owner?.(null);
    },
  };
}

export const vStetCircle = directive<StetOptions & AdapterMeta>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachCircle(element, options as StetOptions),
});

export const vStetBox = directive<StetOptions & AdapterMeta>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachBox(element, options as StetOptions),
});

export const vStetUnderline = directive<StetOptions & AdapterMeta>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachUnderline(element, options as StetOptions),
});

export const vStetHighlight = directive<StetOptions & AdapterMeta>({
  snapshot: sharedOptions,
  targets: (element) => [element],
  attach: ([element], options) => attachHighlight(element, options as StetOptions),
});

export const vStetSticky = directive<StickyOptions & AdapterMeta>({
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

export const vStetMark = directive<StetOptions & { kind: MarkKind } & AdapterMeta>({
  snapshot: (value) => ({ ...sharedOptions(value), kind: value.kind }),
  targets: (element) => [element],
  attach: ([element], options) => {
    const { kind, ...rest } = options as StetOptions & { kind: MarkKind };
    return attachMark(element, kind, rest);
  },
});

export const vStetArrow = directive<ArrowOptions & { to?: Element | null } & AdapterMeta>({
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
