"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  arrow,
  box,
  circle,
  highlight,
  mark,
  sticky,
  underline,
  type ArrowOptions,
  type MarkKind,
  type StetHandle,
  type StetOptions,
  type StickyOptions,
} from "./index.js";
import { updateHandle, type StetRuntimeOptions } from "./mount.js";

type OnHandle = (handle: StetHandle | null) => void;

type TargetProps<T extends StetOptions = StetOptions> = T & {
  target: RefObject<Element | null>;
  onHandle?: OnHandle;
};

type ArrowProps = ArrowOptions & {
  from: RefObject<Element | null>;
  to: RefObject<Element | null>;
  onHandle?: OnHandle;
};

/** Last reconciled state for one annotation instance. */
interface Mounted {
  elements: (Element | null)[];
  handle: StetHandle | null;
  options: Record<string, unknown>;
  visible: boolean;
  /** The callback that received the live handle; it alone receives the null. */
  owner: OnHandle | undefined;
}

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

/**
 * Complete non-visible runtime snapshot. Every known field is present so a
 * later render that drops a prop resets it to its default through updateHandle.
 * `visible`, `onHandle`, and targets never enter this object.
 */
function sharedOptions(props: StetOptions): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  for (const key of sharedKeys) options[key] = props[key];
  return options;
}

function stickyOptions(props: StickyOptions): Record<string, unknown> {
  return {
    ...sharedOptions(props),
    text: props.text,
    side: props.side,
    offsetX: props.offsetX,
    offsetY: props.offsetY,
  };
}

function markOptions(props: StetOptions & { kind: MarkKind }): Record<string, unknown> {
  return { ...sharedOptions(props), kind: props.kind };
}

function arrowOptions(props: ArrowOptions): Record<string, unknown> {
  return {
    ...sharedOptions(props),
    label: props.label,
    curvature: props.curvature,
    labelOffsetX: props.labelOffsetX,
    labelOffsetY: props.labelOffsetY,
  };
}

function sameOptions(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return Object.keys(a).every((key) => a[key] === b[key]);
}

/**
 * Shared lifecycle for every React primitive. Runs after each commit so it can
 * observe the current refs, options, visibility, and callback, and applies the
 * adapter contract's ordered algorithm: target replacement first, then
 * nonreplaying updates, then changed-only visibility, then callback transfer.
 *
 * A no-dependency effect is the React 18-compatible way to reconcile after
 * every render while keeping unmount cleanup in a separate effect; refs cannot
 * change an effect's dependency list, so DOM replacement under a stable ref
 * must be detected here rather than through a dependency array.
 */
function useAnnotation(
  refs: readonly RefObject<Element | null>[],
  options: Record<string, unknown>,
  visible: boolean | undefined,
  onHandle: OnHandle | undefined,
  attach: (elements: Element[], options: StetRuntimeOptions) => StetHandle,
): void {
  const mounted = useRef<Mounted | null>(null);

  useEffect(() => {
    const elements = refs.map((ref) => ref.current);
    const resolved = visible ?? true;
    const missing = elements.some((element) => element === null);
    const previous = mounted.current;

    // No live handle: a missing target is a silent no-op; otherwise attach and
    // deliver the handle to the current callback without a preceding null.
    if (!previous || !previous.handle) {
      if (missing) return;
      const handle = attach(elements as Element[], { ...options, visible: resolved });
      // Commit adapter state before invoking user callbacks.
      mounted.current = { elements, handle, options, visible: resolved, owner: onHandle };
      onHandle?.(handle);
      return;
    }

    const replaced =
      elements.length !== previous.elements.length ||
      elements.some((element, index) => element !== previous.elements[index]);

    // Target replacement or a missing target destroys first, sends null to the
    // callback that owned the handle, then reattaches only if all targets exist.
    // A throwing outgoing callback is surfaced but must not abort a valid
    // replacement, so its failure is captured until the new handle is committed.
    if (missing || replaced) {
      const owner = previous.owner;
      previous.handle.destroy();
      mounted.current = { elements, handle: null, options, visible: resolved, owner: undefined };
      let outgoing: unknown;
      let failed = false;
      try {
        owner?.(null);
      } catch (error) {
        failed = true;
        outgoing = error;
      }
      if (!missing) {
        const handle = attach(elements as Element[], { ...options, visible: resolved });
        mounted.current = { elements, handle, options, visible: resolved, owner: onHandle };
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
    // value, so an unrelated render cannot undo an imperative show/hide.
    if (resolved !== previous.visible) {
      previous.visible = resolved;
      if (resolved) void previous.handle.show();
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
  });

  useEffect(
    () => () => {
      const current = mounted.current;
      mounted.current = null;
      if (!current?.handle) return;
      const owner = current.owner;
      current.handle.destroy();
      owner?.(null);
    },
    [],
  );
}

export function Circle(props: TargetProps): null {
  useAnnotation(
    [props.target],
    sharedOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => circle(elements[0], options as StetOptions),
  );
  return null;
}

export function Box(props: TargetProps): null {
  useAnnotation(
    [props.target],
    sharedOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => box(elements[0], options as StetOptions),
  );
  return null;
}

export function Underline(props: TargetProps): null {
  useAnnotation(
    [props.target],
    sharedOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => underline(elements[0], options as StetOptions),
  );
  return null;
}

export function Highlight(props: TargetProps): null {
  useAnnotation(
    [props.target],
    sharedOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => highlight(elements[0], options as StetOptions),
  );
  return null;
}

export function Sticky(props: TargetProps<StickyOptions>): null {
  useAnnotation(
    [props.target],
    stickyOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => sticky(elements[0], options as unknown as StickyOptions),
  );
  return null;
}

export function Mark(props: TargetProps & { kind: MarkKind }): null {
  useAnnotation(
    [props.target],
    markOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => mark(elements[0], props.kind, options as StetOptions),
  );
  return null;
}

export function Arrow(props: ArrowProps): null {
  useAnnotation(
    [props.from, props.to],
    arrowOptions(props),
    props.visible,
    props.onHandle,
    (elements, options) => arrow(elements[0], elements[1], options as unknown as ArrowOptions),
  );
  return null;
}
