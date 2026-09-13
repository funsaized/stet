# AD-REACT evidence

- Revision/base: `d6fd6e7`
- Environment: Linux; Node v26.7.0; npm 11.19.0
- Files changed: `src/react.ts`, `tests/react.test.ts`
- Acceptance criteria checked: React 18-compatible handle callbacks; StrictMode cleanup ordering; callback identity transfer without remount; changed-only visibility; nonreplaying complete option updates; imperative visibility preservation; stable-ref target replacement; Arrow target replacement.
- Commands and exit status: final `npx vitest run tests/react.test.ts` — 0 (18 passed); `npm run check` — 0; `npm run test:patterns` — 0 (18 passed: Chromium and Firefox); `npx oxfmt src/react.ts tests/react.test.ts` — 0; `npx oxlint src/react.ts tests/react.test.ts` — 0.
- Browser/manual artifacts: Pattern lifecycle and SSR checks passed in Chromium and Firefox; ordinary temporary output was not retained.
- Pre-existing failures: None observed. The pattern server's expected missing `favicon.ico` requests did not fail tests.
- Unverified items and reason: None required by AD-REACT.
- Reviewer decision: APPROVE after callback-transfer and target-replacement exception findings were fixed and regression-tested.
