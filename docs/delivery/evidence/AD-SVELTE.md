# AD-SVELTE evidence

- Revision/base: `d6fd6e7`
- Environment: Linux; Node v26.7.0; npm 11.19.0
- Files changed: `src/svelte.ts`, `tests/svelte.test.ts`
- Acceptance criteria checked: supplied handle/null lifecycle; callback transfer without recreation; changed-only visibility and imperative-state preservation; complete nonreplaying updates; optional action options; missing/replaced Arrow targets and ARIA cleanup; callback exception continuation; no Svelte-specific controller.
- Commands and exit status: `npx vitest run tests/svelte.test.ts` — 0 (14 passed); `npm run check` — 0; `npm run test:patterns` — 0 (18 passed: Chromium and Firefox); `npx oxfmt src/svelte.ts tests/svelte.test.ts` — 0; `npx oxlint src/svelte.ts tests/svelte.test.ts` — 0.
- Browser/manual artifacts: Pattern lifecycle and SSR checks passed in Chromium and Firefox; ordinary temporary output was not retained.
- Pre-existing failures: The first implementation type-check failed on Svelte's conditional-tuple `Action` signature; corrected with a localized public-shape cast. Expected missing `favicon.ico` requests did not fail pattern tests.
- Unverified items and reason: None required by AD-SVELTE.
- Reviewer decision: APPROVE; no confirmed contract or implementation defects.
