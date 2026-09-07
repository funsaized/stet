# Changelog

## Unreleased

- Add a unified website showcase with six live use cases, Product/UX/Engineering/QE
  examples for workspace deletion, billing, search, security and import validation, a deterministic agent walkthrough, and
  inspectable plans, actual source, canonical framework examples and verification scope.
- Add sticky `offsetX`/`offsetY` and arrow `labelOffsetX`/`labelOffsetY` pixel nudges
  after automatic placement and before viewport clamping. Defaults preserve existing
  placement. Core grows by 38 bytes gzip to 6.83 KiB; the 7 KiB guard is unchanged.
- Generate updated option contracts and snippets; add evidence-based handoff guidance
  within existing skills without changing routing or adding a skill.
- Make playground code match its preview, including seed, motion and placement;
  add reset and use canonical framework templates. Test the site against checkout
  source, validate bundled plans and add desktop/mobile interaction and visual checks.

## 0.1.0 — 2026-09-06

- Add agent authoring tools alongside the typed runtime API with typed annotation plans, generated
  schemas/capabilities, actionable standalone validation, local CLI, 30 framework
  snippets, five persistent-control lifecycle patterns and four project-installable
  Agent Skills. Existing runtime APIs are unchanged.
- Recover interrupted skill installation through ownership journals and locks,
  preserving local edits and reporting precise conflicts.
- Add bounded read-only project discovery and a generated illustrative settings
  plan. Missing arrow destinations no longer gate Vue/Svelte sample controls.
- Add contract drift/malformed-input tests, rendered lifecycle and SSR/hydration
  checks, supported Ubuntu WebKit verification, and packed CLI consumers on Node
  20.0.0/24 for Linux and Windows. Browser size budgets and zero required runtime
  dependencies are preserved.
- Complete actual fresh-context routing and application trials, with retained
  failures, focused review/arrow guidance corrections, fresh reruns and a separate
  ordinary-docs baseline. Add pristine-layout comparisons and model-free artifact
  replay. See docs/agent-evals.md for outcomes and limitations.


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
