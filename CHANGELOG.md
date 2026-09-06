# Changelog

## Unreleased

- Add a separate agent authoring layer with typed annotation plans, generated
  schemas/capabilities, standalone validation, local CLI, 30 framework snippets
  and four project-installable Agent Skills. Existing runtime APIs are unchanged.
- Add skill/CLI/schema tests, framework snippet typechecks and an actual packed
  consumer test. Agent tooling adds no required runtime dependencies.


## 0.0.2 — 2026-09-06

- Scroll document annotations natively with their targets, eliminating the
  JavaScript tracking delay during mobile page scrolling.
- Share one passive, frame-batched scroll listener for nested scrollers and
  viewport-aware annotations; skip redraws when tracked targets have not moved.
- Preserve viewport placement for notes and arrow labels, and recheck positioning
  contexts on resize and `refresh()`.
- Add Chromium/Firefox scroll geometry and cleanup regressions. Core size is
  approximately 6.8 KB gzip (the size budget is now 7 KB); CSS is unchanged.

## 0.0.1 — 2026-09-06

Initial public release. The API is under active development, not yet stable 1.0.

- Publish as `@funsaized/stet`, with core and framework subpath exports.

- Replace noisy double strokes with continuous pen gestures, asymmetric open
  circles, and marker washes with slanted ends and a darker nib edge.
- Follow text lines in paragraphs and headings; merge mixed inline fragments.
- Add curved arrows with tangent-aligned heads, `curvature`, and offset labels.
- Make checks compact, beside text or above small icons; retain crossed-off
  wrong marks.
- Give paper notes readable ink, italic fallback typography, a subtle tilt and
  shadow, content-driven height, and viewport-aware side fallback.
- **Changed defaults:** `boil: 0`, `resketchOnHover: false`, stroke width `2.2`,
  note width `176`, note gap `14`, overlay z-index `1000`. Explicit sticky sides
  are now preferences that fall back when they would overflow.
- Add `refresh()`, accessible `description`, scoped theme inheritance,
  `--stet-font`, `--stet-z-index`, and `--stet-highlight-blend`.
- Hide annotations for offscreen/fully clipped targets; refresh after fonts
  load; respond to live reduced-motion changes; make destroyed handles inert.
- Detect React ref replacements, Vue reactive object edits, and Svelte options
  edited in place. Allow parameterless Svelte circle/underline/highlight actions.
- Add an interactive vanilla demo, a runnable Vue example, visual specimens,
  Chromium/Firefox screenshot regressions, and a reproducible benchmark.

- Add deterministic circle, underline, highlight, arrow, sticky, and mark attachers.
- Add CSS-only boil animation, reduced-motion support, and live overlay tracking.
- Add React, Vue, Svelte, and Angular adapters.
