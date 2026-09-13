# CORE-07 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `src/primitives.ts`, and `tests/stet.test.ts`.
- Acceptance criteria checked: source-only `updateHandle` uses a module-private per-handle capability with no registry or public handle/root export; complete snapshots update all six primitives and restore omitted values to defaults; identical snapshots no-op; explicit visibility and current resketched seed are preserved; explicit seed changes redraw at current progress; active operation identity/deadline stays unchanged; animation changes apply to the next entrance; descriptions, arrow labels, and sticky text update safely while visible, explicitly hidden, or culled; hover listeners toggle; invalid timing/support/required fields fail before mutation.
- Commands and exit status: final `npx vitest run tests/stet.test.ts tests/agent/schema.test.ts` — exit 0, 192 passed; final `npm run check` — exit 0; final `git diff --check` — exit 0.
- Browser/manual artifacts: no browser rendering change was required by CORE-07; existing CORE-06 browser output remained the accepted motion baseline.
- Pre-existing failures: none encountered.
- Unverified items and reason: adapter lifecycle behavior is intentionally deferred to the AD tasks; CORE-07 forbids adapter edits.
- Reviewer decision: APPROVE. Follow-up verified hidden/culled semantic updates, per-field placement checks, private capability/public-surface boundaries, and 164 focused runtime tests with no remaining in-scope findings.
