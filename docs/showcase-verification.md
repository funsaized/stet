# Showcase verification

The website uses live React fixtures and explicit Stet adapters. Plans in
`website/src/showcase/scenarios.ts` are source-editing artifacts, never interpreted
by the runtime. Source panels import the actual fixture files and shared options.

## Coverage

- Distinct viewpoint examples: destructive workspace action, billing totals,
  empty-search recovery, account security and CSV filename validation.
- Bug review: reproducible invalid-submit focus failure and a fixed version that
  focuses the invalid field, annotated in green. Both work with ink disabled.
- Developer examples: a deployment form that preserves choices across tutorial
  steps, and an activity inbox with details, filtering and read state.
- Pointer transparency, annotation cleanup, desktop/mobile layouts, accessibility,
  deterministic screenshot baselines, canonical framework code and source refs.
- Playground placement nudges, reset, seeded sketches and opt-in boil at 0.8.

## Commands

```sh
npm test
npm run test:templates
npm run test:package
npm run test:browser
npm --prefix website run check
npm --prefix website test
```

The implementation also adds sticky position offsets and arrow label offsets;
these remain in the Unreleased changelog. The site uses the local source through
Vite aliases. No package release or hosting deployment is implied by these checks.

Fixtures keep changes in local component state. Security controls do not perform
real authentication; import validation checks filenames, not CSV contents. Browser
coverage uses the repository's configured engines; website coverage is Chromium
on desktop and mobile viewports, not a WebKit certification.
