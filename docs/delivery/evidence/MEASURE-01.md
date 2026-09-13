# MEASURE-01 evidence

- Revision/base: `decd089`
- Environment: Linux 7.2.3 x86_64; Node v26.7.0; npm 11.19.0; esbuild 0.28.2 from existing dev dependencies.
- Files changed: `scripts-size.mjs` and `scripts/agent/check-package.mjs`.
- Acceptance criteria checked: the unchanged legacy core and CSS calculations preserve comparable limits; esbuild creates minified browser ESM bundles for a single `circle`, the full core namespace, and each current framework adapter; every graph allowlists only expected browser `dist` modules and verifies its exact external host-framework imports; the minimal bundle's byte delta from full core measures in-module tree-shaking.
- Commands and exit status: worker `npm run size` and `npm run test:package` — exit 0; first post-review `npm run size` — exit 1 because Angular emitted the same allowed `@angular/core` external twice; the check was corrected to compare unique external specifiers; final formatted `npm run size` — exit 0; final `npm run test:package` — exit 0 (`ok: true`, 703,112 archive bytes, 1,323,304 unpacked bytes, 261 files, zero consumer runtime dependencies, 3,387-byte circle and 4,986-byte full bundles); `oxfmt --check` initially reported both modified scripts, then `oxfmt` and `oxlint --deny-warnings` completed successfully.
- Browser/manual artifacts: legacy core 6,989 B gzip; CSS 1,138 B gzip; minimal circle 3,387 B; full core 4,986 B; React 5,435 B; Vue 5,256 B; Svelte 5,208 B; Angular 5,948 B. Adapter figures are total Stet runtime plus adapter glue with host peers externalized.
- Pre-existing failures: none.
- Unverified items and reason: no Playwright or build-tool package entry exists yet, so no such optional integration was measured or implemented. Future optional entries must add their own cases.
- Reviewer decision: APPROVE. The reviewer independently reproduced both required commands and verified that the allowlists reject agent, Node, Playwright, host-framework, and unexpected dist inputs while permitting only each declared external.

Current enforced limits remain exactly 7 KiB for the legacy core calculation and
3 KiB for raw CSS. The new consumer and adapter measurements are reports, not new
or raised budgets.
