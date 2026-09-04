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

@Directive()
abstract class StetDirective<T> implements OnChanges, OnDestroy {
  protected handle?: StetHandle;
  protected abstract options: T;
  protected readonly elementRef = inject<ElementRef<Element>>(ElementRef);
  private renderedOptions?: T;

  constructor() {
    afterNextRender(() => this.render());
  }

  protected abstract attach(element: Element, options: T): StetHandle;

  ngOnChanges(): void {
    if (this.handle && !sameOptions(this.options, this.renderedOptions)) this.render();
  }

  ngOnDestroy(): void {
    this.handle?.destroy();
  }

  private render(): void {
    this.handle?.destroy();
    this.handle = this.attach(this.elementRef.nativeElement, this.options);
    this.renderedOptions = { ...this.options };
  }
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

@Directive({ selector: "[stetCircle]", standalone: true })
export class StetCircleDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetCircle(value: StetOptions | "") {
    this.options = value || {};
  }
  protected attach = circle;
}

@Directive({ selector: "[stetUnderline]", standalone: true })
export class StetUnderlineDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetUnderline(value: StetOptions | "") {
    this.options = value || {};
  }
  protected attach = underline;
}

@Directive({ selector: "[stetHighlight]", standalone: true })
export class StetHighlightDirective extends StetDirective<StetOptions> {
  protected options: StetOptions = {};
  @Input() set stetHighlight(value: StetOptions | "") {
    this.options = value || {};
  }
  protected attach = highlight;
}

@Directive({ selector: "[stetSticky]", standalone: true })
export class StetStickyDirective extends StetDirective<StickyOptions> {
  protected options: StickyOptions = { text: "" };
  @Input() set stetSticky(value: StickyOptions) {
    this.options = value;
  }
  protected attach = sticky;
}

@Directive({ selector: "[stetMark]", standalone: true })
export class StetMarkDirective extends StetDirective<StetOptions & { kind: MarkKind }> {
  protected options: StetOptions & { kind: MarkKind } = { kind: "right" };
  @Input() set stetMark(value: StetOptions & { kind: MarkKind }) {
    this.options = value;
  }
  protected attach(
    element: Element,
    { kind, ...options }: StetOptions & { kind: MarkKind },
  ): StetHandle {
    return mark(element, kind, options);
  }
}

@Directive({ selector: "[stetArrow]", standalone: true })
export class StetArrowDirective extends StetDirective<ArrowOptions & { to: Element }> {
  protected options!: ArrowOptions & { to: Element };
  @Input() set stetArrow(value: ArrowOptions & { to: Element }) {
    this.options = value;
  }
  protected attach(
    element: Element,
    { to, ...options }: ArrowOptions & { to: Element },
  ): StetHandle {
    return arrow(element, to, options);
  }
}
