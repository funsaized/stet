# Changelog

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
