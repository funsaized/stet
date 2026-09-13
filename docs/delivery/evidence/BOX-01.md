# BOX-01 evidence

- Revision/base: `d6fd6e7`
- Files changed: `src/rough.ts`, `tests/rough.test.ts`, `tests/browser/visual.spec.ts`, and reviewed Chromium/Firefox box-geometry snapshots.
- Geometry: one deterministic open perimeter gesture with four sides and a short finishing overlap; seed, roughness, and boil use the existing pen source. Zero, hairline, and small dimensions remain finite.
- Reveal: the same continuous stroked path renders correctly with normalized `pathLength`, dash array, and partial dash offset.
- Commands and exit status: `npx vitest run tests/rough.test.ts` — 0 (15 passed); `npm run check` — 0; focused Playwright box visual test — 0 (Chromium and Firefox); formatter/lint — 0.
- Visual review: APPROVE. Both browsers show coherent hand-drawn perimeters, sensible partial reveal, bounded tiny geometry, and only antialiasing-level differences.
- Reviewer decision: APPROVE; no confirmed geometry or scope defect.
