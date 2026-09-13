# CORE-08 measurement evidence

- Revision/base: `d6fd6e7`
- Commands: pre-decision `npm run size` — 1 because the former 7 KiB guard was exceeded; final `npm run size` with the approved explicit ceiling — 0. All graph/tree-shaking assertions passed. Final `npm run test:package` — 0.
- Current measurements: legacy core 10,604 B gzip; CSS 1,138 B; minimal circle 4,645 B; full core 6,529 B; React 7,203 B; Vue 7,228 B; Svelte 7,202 B; Angular 8,044 B.
- MEASURE-01 deltas: core +3,615 B; CSS +0; circle +1,258 B; full +1,543 B; React +1,768 B; Vue +1,972 B; Svelte +1,994 B; Angular +2,096 B.
- Package: zero runtime dependencies; package installation, exports, assets, and browser graph passed. Archive bytes and file count vary as this required evidence file is added, so they are not treated as a reproducible budget.
- Attribution: 3,180 B of legacy core growth is `mount.ts` motion/reveal behavior; rough geometry +276 B; primitives +123 B; index +3 B. No agent, Node, Playwright, host framework, or unexpected module leaked into browser bundles.
- Tree-shaking: circle remains smaller than full; box, arrow, sticky, and mark code are absent from the circle-only output. Circle still shares the existing single-primitive branches.
- Decision: the integrator explicitly approved an 11 KiB legacy raw-concatenation core ceiling on 2026-09-13. The 3 KiB CSS ceiling is unchanged. Consumer bundle measurements remain reports, with graph and circle-versus-full tree-shaking assertions enforced.
- Reviewer decision: APPROVE. Final size and package checks passed; the explicit 11 KiB/3 KiB guards, measurements, graph exclusions, and tree-shaking were independently reproduced.
