# API reference

## Package exports

| Import | Contents |
| --- | --- |
| `stet` | Vanilla attachers and TypeScript types |
| `stet/react` | React annotation components |
| `stet/vue` | Vue directives |
| `stet/svelte` | Svelte actions |
| `stet/angular` | Angular standalone directives |
| `stet/style.css` | Required layout, drawing, and motion styles |

Framework packages are optional peers. The core has no runtime dependencies.

## Vanilla attachers

```ts
circle(element: Element, options?: StetOptions): StetHandle
underline(element: Element, options?: StetOptions): StetHandle
highlight(element: Element, options?: StetOptions): StetHandle
arrow(from: Element, to: Element, options?: ArrowOptions): StetHandle
sticky(element: Element, options: StickyOptions): StetHandle
mark(element: Element, kind: "right" | "wrong", options?: StetOptions): StetHandle
```

All attachers require browser DOM elements. They throw `TypeError` when a
required element is missing or invalid. `mark` also throws for an invalid kind.
`sticky` throws when `text` is missing or is not a string. Attaching before
`document.body` exists throws `Error`.

### `circle`

Draws one rough ellipse around each client rectangle of the target. Wrapped
inline text receives one ellipse per line.

Default padding: `5` pixels.

### `underline`

Draws a rough line below each client rectangle of the target. Wrapped inline
text receives one underline per line.

Default padding: `3` pixels.

### `highlight`

Draws a translucent marker wash over each client rectangle. The fill uses
multiply blending so text remains legible.

### `arrow`

Draws an open-headed arrow from the edge of `from` to the edge of `to`. Both
elements trigger hover resketching. An optional label appears near the path
midpoint and describes `to`.

### `sticky`

Draws a `160 × 88` pixel paper note outside the target. The note body is real
HTML text and describes the target.

`side: "auto"` checks available viewport space in this order: right, bottom,
left, then top. It does not perform collision detection.

Default gap from the target: `10` pixels, controlled by `padding`.

### `mark`

Draws a check for `"right"` or a crossed pair of lines for `"wrong"`.

Default padding: `4` pixels.

## Options

### `StetOptions`

| Option | Type | Default | Applies to |
| --- | --- | --- | --- |
| `seed` | `number` | random seed | All primitives |
| `roughness` | `number` | `1` | All primitives |
| `boil` | `number` | `0.3` | All primitives |
| `stroke` | `string` | CSS token | All primitives except highlight |
| `fill` | `string` | CSS token | Highlight and sticky |
| `width` | `number` | CSS token | All stroked primitives |
| `resketchOnHover` | `boolean` | `true` | All primitives; controls pointer entry and press |
| `padding` | `number` | primitive-specific | Circle, underline, sticky, and mark |

`boil` is frame jitter in pixels. Set it to `0` to generate one static frame.
Reduced-motion preferences also force one frame and disable hover resketching.

### `ArrowOptions`

Extends `StetOptions`.

| Option | Type | Default |
| --- | --- | --- |
| `label` | `string` | none |

### `StickyOptions`

Extends `StetOptions`.

| Option | Type | Default |
| --- | --- | --- |
| `text` | `string` | required |
| `side` | `"auto" \| "top" \| "right" \| "bottom" \| "left"` | `"auto"` |

## Exported types

The core package exports `StetOptions`, `ArrowOptions`, `StickyOptions`,
`StetHandle`, and `MarkKind`. `MarkKind` is `"right" | "wrong"`.

`stet/svelte` also exports `ActionReturn<T>`, the return type shared by its
actions.

## Handle

Every attacher returns:

```ts
interface StetHandle {
  resketch(seed?: number): void;
  destroy(): void;
}
```

`resketch()` redraws with a fresh random seed. `resketch(seed)` redraws with the
given seed. It retains the original options.

`destroy()` removes the overlay, observers, event listeners, and any
`aria-describedby` relationship created by the annotation. Call it before
discarding a manually attached annotation.

## React

React 18 and 19 are supported. All components render `null` and attach to refs
after mount.

```ts
Circle(props: StetOptions & { target: RefObject<Element | null> }): null
Underline(props: StetOptions & { target: RefObject<Element | null> }): null
Highlight(props: StetOptions & { target: RefObject<Element | null> }): null
Sticky(props: StickyOptions & { target: RefObject<Element | null> }): null
Mark(props: StetOptions & {
  target: RefObject<Element | null>;
  kind: "right" | "wrong";
}): null
Arrow(props: ArrowOptions & {
  from: RefObject<Element | null>;
  to: RefObject<Element | null>;
}): null
```

The target refs must resolve when the annotation component's effect runs.

## Vue

Vue 3 directives attach to their host element.

| Export | Binding value |
| --- | --- |
| `vStetCircle` | `StetOptions` |
| `vStetUnderline` | `StetOptions` |
| `vStetHighlight` | `StetOptions` |
| `vStetSticky` | `StickyOptions` |
| `vStetMark` | `StetOptions & { kind: "right" \| "wrong" }` |
| `vStetArrow` | `ArrowOptions & { to: Element }`; host is `from` |

In `<script setup>`, imported names such as `vStetCircle` are available as
`v-stet-circle` in the template.

## Svelte

Svelte actions attach to their host element.

| Export | Action parameter |
| --- | --- |
| `circle` | `StetOptions` |
| `underline` | `StetOptions` |
| `highlight` | `StetOptions` |
| `sticky` | `StickyOptions` |
| `mark` | `StetOptions & { kind: "right" \| "wrong" }` |
| `arrow` | `ArrowOptions & { to: Element }`; host is `from` |

Each action returns `update(options)` and `destroy()`.

## Angular

Angular 20 and 21 are supported. Every export is a standalone directive.
Attachment uses `afterNextRender`, so it does not run during server rendering.

| Export | Selector and input |
| --- | --- |
| `StetCircleDirective` | `[stetCircle]="options"` |
| `StetUnderlineDirective` | `[stetUnderline]="options"` |
| `StetHighlightDirective` | `[stetHighlight]="options"` |
| `StetStickyDirective` | `[stetSticky]="stickyOptions"` |
| `StetMarkDirective` | `[stetMark]="optionsWithKind"` |
| `StetArrowDirective` | `[stetArrow]="optionsWithTo"`; host is `from` |

## CSS custom properties

Set tokens on `:root` to theme all annotations. Per-call options set local
overrides on one overlay.

| Property | Default | Used by |
| --- | --- | --- |
| `--stet-stroke` | `#c92a2a` | General strokes and arrow labels |
| `--stet-fill` | `#ffe066` | Highlights |
| `--stet-paper` | `#fff3bf` | Sticky paper and arrow label backgrounds |
| `--stet-width` | `2` | Path stroke width |
| `--stet-correct` | `#2b8a3e` | Right marks |
| `--stet-wrong` | `#c92a2a` | Wrong marks |
| `--stet-note` | `#f08c00` | Sticky border and text |

## Stable markup classes

| Class | Element |
| --- | --- |
| `.stet-overlay` | Body-level overlay container |
| `.stet-overlay--circle` | Circle overlay container |
| `.stet-overlay--underline` | Underline overlay container |
| `.stet-overlay--highlight` | Highlight overlay container |
| `.stet-overlay--arrow` | Arrow overlay container |
| `.stet-overlay--sticky` | Sticky overlay container |
| `.stet-overlay--mark` | Mark overlay container |
| `.stet-svg` | Decorative SVG |
| `.stet-boil` | Animated path frame |
| `.stet-circle` | Circle path |
| `.stet-underline` | Underline path |
| `.stet-highlight` | Highlight path |
| `.stet-arrow` | Arrow path |
| `.stet-sticky-paper` | Sticky paper path |
| `.stet-sticky-text` | Sticky HTML text |
| `.stet-label` | Arrow HTML label |
| `.stet-mark` | Right-mark and wrong-mark paths |
| `.stet-mark--right` | Right-mark path |
| `.stet-mark--wrong` | Wrong-mark path |

Theme with the documented custom properties. Path structure and frame counts
may vary with motion preferences and options.

## Runtime and browser behavior

- ESM only.
- Client-side attachment only.
- Requires `ResizeObserver` for resize tracking.
- Supports the latest two Chrome, Firefox, Safari, and Edge releases.
- Tracks target and parent resize, viewport resize, and nested scrolling.
- Does not intercept target pointer events or create tab stops.
- Uses no Shadow DOM and causes no layout shift.

## Related

- Learn the API by following the [tutorial](tutorial.md).
- Understand the design in [How stet marks live UI](explanation.md).
