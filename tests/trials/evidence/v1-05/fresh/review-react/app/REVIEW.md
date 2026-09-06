# Email pattern review

Implementation: `App.tsx`. Authoring plan: `review.plan.json`.

Source evidence and plan:
- `App.tsx`: the existing `label[htmlFor="good-email"]` matches `input#good-email`. Preserve both and attach a right mark plus “Right: associated label stays visible. Keep it.”
- `App.tsx`: `input#bad-email` has `placeholder="Email"` and no associated label. Preserve the example and attach a wrong mark plus “Wrong: placeholder only. Add a persistent associated label.” This verdict concerns the supplied labeling guideline only.
- Installed Stet 0.0.2: `stet inspect --json`, `stet schema annotation-plan`, and React mark/sticky snippets establish the supported primitives, refs, options and CSS import. `node_modules/@funsaized/stet/dist/react.js` confirms effect cleanup calls `destroy()`.
- Conditionally render the four annotation components under `enabled`; keep both inputs mounted. Use fixed seeds, no animation, and responsive spacing for notes. Sticky text supplies the meaning of each decorative mark without duplicate descriptions.

Validation completed:
- `stet validate review.plan.json --json`: valid; two DECORATIVE_ONLY warnings for marks are satisfied by companion sticky text on the same targets.
- `npm run check` and `npm run build`: pass (TypeScript check and browser bundling).
- Browser: inspected screenshots at 1000px and 375px; readable notes and preserved examples.
- Browser: unique targets, native label association, typing, label click focus, tab order, and Save submission pass.
- Browser: disabling removes overlays and generated aria-describedby attributes while preserving input values; re-enabling and unrelated target replacement/removal create no duplicate overlays; unmount removes overlays and note/description nodes.
- Browser: mobile scrolling, clicking and typing pass; overlays use pointer-events:none; no horizontal overflow or application console errors observed.

Screenshots: `email-review-desktop.png`, `email-review-mobile.png`.
