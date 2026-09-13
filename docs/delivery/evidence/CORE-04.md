# CORE-04 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `tests/stet.test.ts`, and `tests/browser/reveal.spec.ts`.
- Acceptance criteria checked: circle joins the existing underline path-length controller; circle and underline share timing, delay, hidden attach, culling/detachment, reduced-motion, zero-duration, and refresh/resketch behavior; circle never uses opacity reveal; settled animated geometry is byte-identical to static geometry for the same seed.
- Commands and exit status: final `npx vitest run tests/stet.test.ts` — exit 0, 72 passed; final `npm run check` — exit 0; final `npm run test:browser -- tests/browser/reveal.spec.ts --project=chromium` — exit 0, 12 passed; final `git diff --check` — exit 0. Generated outputs remained unchanged after build.
- Browser/manual artifacts: `/tmp/opencode/CORE-04-mid.png` showed an opaque partial oval at dash offset about 0.4997; `/tmp/opencode/CORE-04-final.png` showed the complete stable ellipse with reveal attributes removed. Reviewer inspected both. No snapshots changed.
- Pre-existing failures: none encountered.
- Unverified items and reason: Firefox/WebKit were not required by the task's targeted browser verification.
- Reviewer decision: APPROVE with no confirmed findings or missing required coverage.
