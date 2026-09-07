# API reference

## Package exports

The npm package is `@funsaized/stet`. **stet** is the product name; use the
scoped package paths shown below for imports.

| Import | Contents |
| --- | --- |
| `@funsaized/stet` | Vanilla attachers and TypeScript types |
| `@funsaized/stet/react` | React annotation components |
| `@funsaized/stet/vue` | Vue directives |
| `@funsaized/stet/svelte` | Svelte actions |
| `@funsaized/stet/angular` | Angular standalone directives |
| `@funsaized/stet/style.css` | Required layout, drawing, and motion styles |
| `@funsaized/stet/agent` | Build-time plan type and validation; separate from runtime |
| `@funsaized/stet/agent/capabilities.json` | Installed capability metadata |
| `@funsaized/stet/agent/schemas/*` | Published JSON schemas |

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

Draws an open, overlapping pen loop around each client rectangle of the target.
Wide targets receive flatter shoulders; wrapped inline text receives one loop
per line. The loop follows the bounding rectangle of transformed elements.

Default padding: `5` pixels.

### `underline`

Draws a gently bowed pen stroke beneath each line. Paragraphs, headings, and
common inline text elements use text ranges, so the mark follows the words
instead of a block's empty right margin.

Default padding: `3` pixels.

### `highlight`

Draws a translucent marker stroke with slanted ends and a slightly darker nib
edge. Text ranges follow wrapped paragraphs and inline text. Mixed inline
fragments on the same line are merged. Other elements receive a box-sized wash.
Multiply blending preserves dark text on light surfaces. Use
`--stet-highlight-blend: screen` on dark surfaces with light text.

### `arrow`

Draws an open-headed arrow from the edge of `from` to the edge of `to`. Both
elements can trigger hover resketching when enabled. An optional label appears near the path
midpoint and describes `to`. The shaft bends gently by default and its open,
asymmetric head follows the curve's tangent. `curvature: 0` makes it straight;
negative values bend in the opposite direction. Labels sit above horizontal
arrows or beside vertical arrows and try to clear the two anchor boxes.

### `sticky`

Draws a lightly tilted paper note outside the target. Default width is `176`
pixels, reduced to fit narrow viewports. Height starts at `88` pixels and grows
with the text. The note body is real HTML and describes the target. All note
content ignores pointer events, allowing the original UI to remain interactive.

`side: "auto"` tries right, bottom, left, then top, including the note's measured
height, gap, and viewport gutter. Explicit sides are preferences: if they do
not fit, the note tries another side. The final position is clamped to a
12-pixel viewport gutter. It does not avoid neighboring UI or other notes.
Keep notes concise; a note taller than the viewport cannot be fitted completely.

Default gap from the target: `14` pixels, controlled by `padding`.

### `mark`

Draws a compact check beside `"right"` targets (above targets narrower than
40px), or a crossed pair of pen strokes over `"wrong"` targets. Allow room for
the check in dense layouts. Use `description` when the mark carries meaning.

Default padding: `4` pixels.

## Options

### `StetOptions`

| Option | Type | Default | Applies to |
| --- | --- | --- | --- |
| `seed` | `number` | random seed | All primitives |
| `roughness` | `number` | `1` | All primitives |
| `boil` | `number` | `0` | All primitives |
| `stroke` | `string` | CSS token | All primitives except highlight |
| `fill` | `string` | CSS token | Highlight and sticky |
| `width` | `number` | CSS token | All stroked primitives |
| `resketchOnHover` | `boolean` | `false` | All primitives; controls pointer entry and press |
| `padding` | `number` | primitive-specific | Circle, underline, sticky, and mark |
| `description` | `string` | none | Accessible meaning for any primitive; describes `to` for arrows |

`boil` controls frame variation. `0` generates one static frame; try `0.3` for
subtle optional motion. Reduced-motion preferences force one frame and disable
hover resketching, including when the preference changes while mounted.
Options are copied on attachment. To change options in vanilla, destroy and
reattach; framework adapters do this when their options change.

### `ArrowOptions`

Extends `StetOptions`.

| Option | Type | Default |
| --- | --- | --- |
| `label` | `string` | none |
| `curvature` | `number` | `0.16`; signed bend, clamped to `-0.8…0.8` |
| `labelOffsetX`, `labelOffsetY` | `number` | `0`; label nudge in viewport pixels (unreleased) |

### `StickyOptions`

Extends `StetOptions`.

| Option | Type | Default |
| --- | --- | --- |
| `text` | `string` | required |
| `side` | `"auto" \| "top" \| "right" \| "bottom" \| "left"` | `"auto"` |

Sticky also accepts `offsetX` and `offsetY` (numbers, default `0`; unreleased).
Positive x moves right; positive y moves down. Sticky nudges apply after side
selection; arrow label nudges apply after automatic label placement. Both apply
before viewport clamping, so a nudge may be limited near an edge. Neither changes
application layout or detects collisions. Arrow nudges leave the path unchanged.

```js
sticky(button, { text: "Review this change.", side: "right", offsetY: 24 });
arrow(from, to, { label: "Changed", curvature: -0.2, labelOffsetY: -18 });
```

These additions are in this checkout, not the published 0.1.0 package. Inspect
installed capabilities before copying them. Try fewer marks, shorter copy,
existing `side`/`padding`, or removing redundant labels first. Use `curvature` to
adjust a crossing arrow; no automatic obstacle routing is provided.

## Exported types

The core package exports `StetOptions`, `ArrowOptions`, `StickyOptions`,
`StetHandle`, and `MarkKind`. `MarkKind` is `"right" | "wrong"`.

`@funsaized/stet/svelte` also exports `ActionReturn<T>`, the return type shared by its
actions.

## Handle

Every attacher returns:

```ts
interface StetHandle {
  resketch(seed?: number): void;
  refresh(): void;
  destroy(): void;
}
```

`resketch()` redraws with a fresh random seed. `resketch(seed)` redraws with the
given seed. It retains the original options.

`refresh()` remeasures the targets without changing the current seed. Use it
after application-driven movement that does not resize the target or parent,
or after changing locally scoped theme tokens. It does not run a tracking loop.

`destroy()` removes the overlay, observers, event listeners, and any
`aria-describedby` relationship created by the annotation. Call it before
discarding a manually attached annotation.
Calls to any handle method after destruction are harmless.

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
Changes to the referenced DOM node are detected on subsequent React commits,
including null refs. Ref mutations that happen outside React rendering need
an application render. Strict Mode cleanup is supported.

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
`circle`, `underline`, and `highlight` also accept no parameter: `use:circle`.
Vue directives and Svelte actions snapshot option values so edits in place
are applied when their framework invokes the update lifecycle. Angular inputs
should be replaced with a new options object when changing their values.

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

Set tokens on `:root` to theme all annotations, or on a target/ancestor to scope
them. Scoped tokens are copied to the body overlay on mount and `refresh()`;
global tokens remain inherited. Per-call options take precedence. Arrow themes
come from the source element. No font is downloaded by the library.

| Property | Default | Used by |
| --- | --- | --- |
| `--stet-stroke` | `#c92a2a` | General strokes and arrow labels |
| `--stet-fill` | `#ffe066` | Highlights |
| `--stet-paper` | `#fff3bf` | Sticky paper and arrow label backgrounds |
| `--stet-width` | `2.2` | Path stroke width |
| `--stet-correct` | `#2b8a3e` | Right marks |
| `--stet-wrong` | `#c92a2a` | Wrong marks |
| `--stet-note` | `#68502c` | Sticky ink and faint paper edge |
| `--stet-font` | Segoe Print, Bradley Hand, Chalkboard SE, Georgia, serif | Labels and notes; italic fallback typography |
| `--stet-z-index` | `1000` | Overlay stacking; set relative to your application's layers |
| `--stet-highlight-blend` | `multiply` | Use `screen` for light text on dark surfaces, or `normal` for custom compositing |

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
| `.stet-highlight-edge` | Darker marker edge |
| `.stet-arrow` | Arrow path |
| `.stet-sticky-paper` | Sticky paper path |
| `.stet-sticky-text` | Sticky HTML text |
| `.stet-label` | Arrow HTML label |
| `.stet-mark` | Right-mark and wrong-mark paths |
| `.stet-mark--right` | Right-mark path |
| `.stet-mark--wrong` | Wrong-mark path |
| `.stet-description` | Visually hidden description text |

Theme with the documented custom properties. Path structure and frame counts
may vary with motion preferences and options.

## Runtime and browser behavior

- ESM only.
- Client-side attachment only.
- Requires `ResizeObserver` for resize tracking.
- Supports the latest two Chrome, Firefox, Safari, and Edge releases.
- Tracks target and parent resize, viewport resize, and nested scrolling.
- Refreshes after fonts load; hides annotations when targets leave the viewport
  or are fully clipped by scroll containers (`IntersectionObserver`).
- Does not intercept target pointer events or create tab stops.
- Uses no Shadow DOM and causes no layout shift.

Partially clipped marks can extend beyond their scroll container. Arbitrary
movement without resize needs `refresh()`. Rotations use axis-aligned bounding
boxes; transformed or CSS-zoomed `body`/`html` containing blocks, cross-document
elements, and top-layer dialogs are not supported placement contexts. Forced
colors replace ink with system colors and marker fills with visible outlines.

## Related

- Learn the API by following the [tutorial](tutorial.md).
- Understand the design in [How stet marks live UI](explanation.md).

Agent authoring tools and CLI are documented in the [agent guide](agent-usage.md).
