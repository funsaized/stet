# CORE-03 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `tests/stet.test.ts`, and new `tests/browser/reveal.spec.ts`.
- Acceptance criteria checked: opt-in underline entrance uses normalized SVG path-length dash offset from 1 to 0 without opacity; first paint is fully undrawn; duration and delay are clock-based; initial `visible:false` defers entrance until `show()`; refresh, resketch, scroll, and resize preserve progress/deadline; offscreen and detached operations settle while culled and reconnect at the final frame; static, zero-duration, and initial reduced-motion paths remain immediate.
- Commands and exit status: final `npx vitest run tests/stet.test.ts` — exit 0, 65 passed; final `npm run check` — exit 0; `npm run test:browser -- tests/browser/reveal.spec.ts --project=chromium` — exit 0, 7 passed; `npm run test:browser -- tests/browser/scroll.spec.ts --project=chromium` — exit 0, 6 passed; final `git diff --check` — exit 0.
- Browser/manual artifacts: `/tmp/opencode/CORE-03-mid.png` showed an opaque partial stroke at measured dash offset 0.4834; `/tmp/opencode/CORE-03-final.png` showed the complete same stroke with reveal attributes removed. Reviewer inspected both. No checked-in snapshots changed.
- Pre-existing failures: none encountered.
- Unverified items and reason: Firefox/WebKit were not required by the task's targeted browser verification.
- Reviewer decision: APPROVE. Follow-up confirmed logical completion while still culled and detached/reconnected final-frame behavior; no remaining in-scope defects.
