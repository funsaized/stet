# AD-VUE evidence

- Revision/base: `d6fd6e7`
- Environment: Linux; Node v26.7.0; npm 11.19.0
- Files changed: `src/vue.ts`, `tests/vue.test.ts`
- Acceptance criteria checked: handle/null directive lifecycle; callback transfer without remount; changed-only visibility and imperative-state preservation; complete nonreplaying updates; missing and replaced Arrow targets; host replacement; callback exception ordering; adapter metadata excluded from runtime options.
- Commands and exit status: `npx vitest run tests/vue.test.ts` — 0 (12 passed); `npm run check` — 0; `npm run test:patterns` — 0 (18 passed: Chromium and Firefox); `npx oxfmt src/vue.ts tests/vue.test.ts` — 0; `npx oxlint src/vue.ts tests/vue.test.ts` — 0.
- Browser/manual artifacts: Pattern lifecycle and SSR checks passed in Chromium and Firefox; ordinary temporary output was not retained.
- Pre-existing failures: None observed. Expected missing `favicon.ico` requests did not fail pattern tests.
- Unverified items and reason: None required by AD-VUE.
- Reviewer decision: APPROVE after missing-target and callback-exception replacement findings were fixed and regression-tested.
