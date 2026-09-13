# CORE-05 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `src/primitives.ts`, `src/index.ts`, `tests/stet.test.ts`, and `tests/browser/reveal.spec.ts`.
- Acceptance criteria checked: one operation per handle; `show()` joins the exact attach/replay promise; settled/static calls return fresh fulfilled results; replay cancels and supersedes delaying/revealing operations before the replacement settles; hide/destroy cancel exactly once without rejection or late finish; hidden replay restores ARIA; zero duration and reduced motion create no operation; post-destroy methods are harmless and show/replay return fresh cancelled results; refresh/resketch preserve promise identity/deadline; arrow/sticky retain replay.
- Commands and exit status: final `npx vitest run tests/stet.test.ts` — exit 0, 100 passed; final `npm run check` — exit 0; `npm run test:browser -- tests/browser/reveal.spec.ts --project=chromium` — exit 0, 20 passed; final `git diff --check` — exit 0.
- Browser/manual artifacts: Chromium covered in-flight joining, replay supersession order, hide cancellation, and destroy cancellation for circle and underline. No snapshots changed.
- Pre-existing failures: none encountered.
- Unverified items and reason: live browser preference changes and ambient-motion composition are assigned to CORE-06.
- Reviewer decision: APPROVE after adding delaying replay, refresh/resketch promise identity, and arrow/sticky replay-ARIA coverage. No reproducible race or remaining CORE-05 defect.
