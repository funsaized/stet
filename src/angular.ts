import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  Input,
  type OnChanges,
  type OnDestroy,
} from "@angular/core";
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
 * Shared directive lifecycle for every Angular primitive. Applies the adapter
 * contract's ordered algorithm on each change: target replacement first, then
 * nonreplaying updates, then changed-only visibility, then callback transfer.
 *
 * `stetOnHandle` is an inherited separate input so the primary options input
 * stays serializable. Attachment stays deferred to `afterNextRender` so server
 * rendering never touches the DOM and hydration attaches only on the client.
 */
@Directive()
abstract class StetDirective<T extends StetOptions> implements OnChanges, OnDestroy {
  protected abstract options: T;
  protected readonly elementRef = inject<ElementRef<Element>>(ElementRef);
  @Input() stetOnHandle?: OnHandle;
  private mounted?: Mounted;
  private rendered = false;

  constructor() {
    afterNextRender(() => {
      this.rendered = true;
      this.reconcile();
    });
  }

  /** Required targets; null entries are unresolved. */
  protected targets(_value: T): (Element | null)[] {
    return [this.elementRef.nativeElement];
  }

  /** Complete runtime snapshot excluding visibility and adapter metadata. */
  protected snapshot(value: T): Record<string, unknown> {
    return sharedOptions(value);
  }

  protected abstract attach(targets: Element[], options: StetRuntimeOptions): StetHandle;

  ngOnChanges(): void {
    if (this.rendered) this.reconcile();
  }

  ngOnDestroy(): void {
    const current = this.mounted;
    this.mounted = undefined;
    if (!current?.handle) return;
    const owner = current.owner;
    current.handle.destroy();
    owner?.(null);
  }

  private reconcile(): void {
    const value = (this.options ?? {}) as T;
    const elements = this.targets(value);
    const options = this.snapshot(value);
    const visible = value.visible ?? true;
    const onHandle = this.stetOnHandle;
    const missing = elements.some((target) => target === null);
    const previous = this.mounted;

    // No live handle: a missing target is a silent no-op; otherwise attach and
    // deliver the handle to the current callback without a preceding null.
    if (!previous || !previous.handle) {
      if (missing) return;
      const handle = this.attach(elements as Element[], { ...options, visible });
      // Commit directive state before invoking user callbacks.
      this.mounted = { elements, handle, options, visible, owner: onHandle };
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
      this.mounted = { elements, handle: null, options, visible, owner: undefined };
      let outgoing: unknown;
      let failed = false;
      try {
        owner?.(null);
      } catch (error) {
        failed = true;
        outgoing = error;
      }
      if (!missing) {
        const handle = this.attach(elements as Element[], { ...options, visible });
        this.mounted = { elements, handle, options, visible, owner: onHandle };
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
  }
}

@Directive({ selector: "[stetCircle]", standalone: true })
export class StetCircleDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetCircle(value: StetOptions | "") {
    this.options = value || {};
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    return circle(element, options as StetOptions);
  }
}

@Directive({ selector: "[stetBox]", standalone: true })
export class StetBoxDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetBox(value: StetOptions | "") {
    this.options = value || {};
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    return box(element, options as StetOptions);
  }
}

@Directive({ selector: "[stetUnderline]", standalone: true })
export class StetUnderlineDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetUnderline(value: StetOptions | "") {
    this.options = value || {};
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    return underline(element, options as StetOptions);
  }
}

@Directive({ selector: "[stetHighlight]", standalone: true })
export class StetHighlightDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetHighlight(value: StetOptions | "") {
    this.options = value || {};
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    return highlight(element, options as StetOptions);
  }
}

@Directive({ selector: "[stetSticky]", standalone: true })
export class StetStickyDirective extends StetDirective<StickyOptions> {
  protected options: StickyOptions = { text: "" };
  @Input() set stetSticky(value: StickyOptions) {
    this.options = value;
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected override snapshot(value: StickyOptions): Record<string, unknown> {
    return {
      ...sharedOptions(value),
      text: value.text,
      side: value.side,
      offsetX: value.offsetX,
      offsetY: value.offsetY,
    };
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    return sticky(element, options as StickyOptions);
  }
}

@Directive({ selector: "[stetMark]", standalone: true })
export class StetMarkDirective extends StetDirective<StetOptions & { kind: MarkKind }> {
  protected options: StetOptions & { kind: MarkKind } = { kind: "right" };
  @Input() set stetMark(value: StetOptions & { kind: MarkKind }) {
    this.options = value;
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  protected override snapshot(value: StetOptions & { kind: MarkKind }): Record<string, unknown> {
    return { ...sharedOptions(value), kind: value.kind };
  }
  protected attach([element]: Element[], options: StetRuntimeOptions): StetHandle {
    const { kind, ...rest } = options as StetOptions & { kind: MarkKind };
    return mark(element, kind, rest);
  }
}

@Directive({ selector: "[stetArrow]", standalone: true })
export class StetArrowDirective extends StetDirective<ArrowOptions & { to?: Element | null }> {
  protected options!: ArrowOptions & { to?: Element | null };
  @Input() set stetArrow(value: ArrowOptions & { to?: Element | null }) {
    this.options = value;
  }
  override ngOnChanges(): void {
    super.ngOnChanges();
  }
  // An absent destination is as unresolved as a null one: never pass either to
  // the primitive, and wait silently until an Element appears.
  protected override targets(value: ArrowOptions & { to?: Element | null }): (Element | null)[] {
    return [this.elementRef.nativeElement, value.to ?? null];
  }
  protected override snapshot(
    value: ArrowOptions & { to?: Element | null },
  ): Record<string, unknown> {
    return {
      ...sharedOptions(value),
      label: value.label,
      curvature: value.curvature,
      labelOffsetX: value.labelOffsetX,
      labelOffsetY: value.labelOffsetY,
    };
  }
  protected attach([element, to]: Element[], options: StetRuntimeOptions): StetHandle {
    return arrow(element, to, options as ArrowOptions);
  }
}
