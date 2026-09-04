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
scrolling. After an unobserved layout change, calling `resketch()` updates its
position and draws a fresh variation.

## Why sketches are seeded

Hand-drawn marks need variation, but uncontrolled randomness makes testing and
reproduction difficult. Every drawing therefore starts from a numeric seed.

The seed drives a small deterministic pseudo-random generator. Geometry is
sampled into points, jittered, and converted to smooth SVG paths. The same
dimensions, options, and seed produce the same path data.

Calling `resketch()` chooses a fresh seed. Calling `resketch(42)` redraws with
a known seed. This gives demos natural variation while keeping screenshots and
tests repeatable.

## Boil without a JavaScript animation loop

A boiling stroke subtly changes shape like ink moving between animation
frames. `stet` generates three deterministic path variants during a draw. CSS
switches their visibility on a 1.2 second cycle.

There is no `requestAnimationFrame` loop. JavaScript only redraws when geometry
or the seed changes. This keeps animation work in the browser's style and paint
pipeline.

When `prefers-reduced-motion: reduce` matches, `stet` generates one frame. It
also disables pointer-triggered resketching. Setting `boil: 0` provides the same
static path behavior without changing hover resketching.

## Text and accessibility

Circles, underlines, highlights, arrows, and marks are decorative SVG. Their
SVG containers use `aria-hidden="true"`.

Sticky text and arrow labels can carry meaning. They are HTML rather than SVG
text. `stet` associates them with the target through `aria-describedby` and
restores that attribute when the annotation is destroyed.

Right and wrong marks also differ by shape. They do not rely on green and red
alone.

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

`stet` is not a tour engine or a layout system. Sticky `side: "auto"` makes a
simple viewport-space choice. It does not avoid every nearby element.

Annotations are ephemeral. The library does not persist them, synchronize
them, or let users draw freehand. Those concerns require application state and
interaction models that do not belong in annotation chrome.

## Related

- Follow the [first annotation tutorial](tutorial.md).
- Look up exact signatures and defaults in the [API reference](reference.md).
