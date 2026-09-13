# CORE-06 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `tests/stet.test.ts`, and `tests/browser/reveal.spec.ts`.
- Acceptance criteria checked: live reduced motion during delay/reveal/offscreen settles the current promise `finished` at the final frame; reduced motion disables hover and renders one stable boil variant; hover, boil, refresh, resketch, fonts, theme, resize, and scroll preserve operation identity/deadline and current progress; boil variants share reveal state without frame-zero/final flashes; deterministic reduced-motion captures are byte-stable with no active document animations.
- Commands and exit status: final `npx vitest run tests/stet.test.ts` — exit 0, 112 passed; final `npm run check` — exit 0; final `npm run test:browser -- tests/browser/reveal.spec.ts tests/browser/scroll.spec.ts --project=chromium` — exit 0, 33 passed; final `git diff --check` — exit 0.
- Browser/manual artifacts: browser capture check produced two byte-identical reduced-motion overlay screenshots and asserted one path/no active animations. No checked-in snapshots changed.
- Pre-existing failures: none encountered.
- Unverified items and reason: Firefox/WebKit were not required by the focused task verification.
- Reviewer decision: APPROVE. A real frame-zero boil flash was fixed by priming dash state while retaining the original operation deadline; reviewer found no remaining defect or missing required check.
