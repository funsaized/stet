# How stet marks live UI

`stet` treats annotations as chrome around an interface. The application keeps
ownership of its elements. The library measures those elements and paints a
separate visual layer.

This distinction is the main design constraint. A circle around a button must
not become a new button. The original element continues to handle focus,
clicks, validation, layout, and accessible semantics.

## An overlay, not a component system

Each primitive receives one or two existing DOM elements. It measures their
viewport rectangles and places a fixed overlay on `document.body`. Decorative
SVG paths ignore pointer events, so they cannot block the underlying UI.

Body-level overlays also work with elements that cannot contain children, such
as inputs. They avoid changing the target's box or creating layout shift.

The overlay follows target resizing, parent resizing, viewport resizing, and
scrolling. It hides marks when targets leave the viewport or are fully clipped
inside a scroller, and refreshes geometry after fonts load. After an unobserved
layout change, `refresh()` updates placement while retaining the current seed.

## Why sketches are seeded

Hand-drawn marks need variation, but uncontrolled randomness makes testing and
reproduction difficult. Every drawing therefore starts from a numeric seed.

The seed drives a small deterministic pseudo-random generator. Pen lines use
long Bézier gestures; circles use correlated harmonic variation, asymmetry,
flatter shoulders on wide targets, and an open finishing overlap. The marker
uses its own filled path with slanted ends and a darker nib edge. The same
dimensions, options, and seed produce the same path data.

Calling `resketch()` chooses a fresh seed. Calling `resketch(42)` redraws with
a known seed. This gives demos natural variation while keeping screenshots and
tests repeatable.

## Boil without a JavaScript animation loop

Marks stay still by default. Optional `boil: 0.3` subtly changes a stroke's shape
between three deterministic variants. CSS switches their visibility on a
1.2 second cycle. Only SVGs with animated frames receive a CSS animation.

There is no `requestAnimationFrame` loop. JavaScript only redraws when geometry
or the seed changes. This keeps animation work in the browser's style and paint
pipeline.

When `prefers-reduced-motion: reduce` matches, `stet` generates one frame. It
also disables pointer-triggered resketching. Setting `boil: 0` provides the same
static path behavior without changing hover resketching. Hover resketching is
also opt-in, through `resketchOnHover: true`. Motion preferences are observed
while annotations are mounted.

## Text and accessibility

Circles, underlines, highlights, arrows, and marks are decorative SVG. Their
SVG containers use `aria-hidden="true"`.

Sticky text and arrow labels can carry meaning. They are HTML rather than SVG
text. `stet` associates them with the target through `aria-describedby` and
restores that attribute when the annotation is destroyed.

Right and wrong marks also differ by shape. They do not rely on green and red
alone.

Any primitive can carry a `description`, so a circle or check can communicate
meaning through the target's accessible description. Existing descriptions and
later application edits to `aria-describedby` are preserved during cleanup.

## Thin framework adapters

The geometry engine is framework-independent. React components, Vue
directives, Svelte actions, and Angular directives only manage lifecycle:

1. Wait until the target exists in the browser.
2. Call the vanilla attacher.
3. Reattach when relevant options change.
4. Destroy the annotation during unmount.

Keeping geometry in one core prevents the adapters from producing different
drawings or accessibility behavior.

## Deliberate limits

`stet` is not a tour engine or a layout system. Notes measure their text, try
available sides, and shift inside the viewport gutter. This prevents a common
mobile failure without taking ownership of application layout. They do not
avoid other annotations or neighboring controls. Leave room in the margin.

Scoped CSS tokens are copied from the target to the body overlay on mount or
`refresh()`. This lets a dark panel use screen-blended highlights while a light
panel uses multiply blending. A custom font is optional; the library never
downloads one.

Annotations are ephemeral. The library does not persist them, synchronize
them, or let users draw freehand. Those concerns require application state and
interaction models that do not belong in annotation chrome.

## Related

- Follow the [first annotation tutorial](tutorial.md).
- Look up exact signatures and defaults in the [API reference](reference.md).
