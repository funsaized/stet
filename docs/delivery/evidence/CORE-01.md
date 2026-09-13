# CORE-01 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `src/primitives.ts`, `tests/stet.test.ts`, `tests/browser/scroll.spec.ts`, `agent/catalog.mjs`, and generated `agent/annotation-plan.d.ts`, `agent/capabilities.json`, `agent/schemas/annotation-plan.schema.json`, `agent/schemas/capabilities.schema.json`, and `agent/validate.generated.mjs`.
- Acceptance criteria checked: all six primitives default visible and expose `show()`/`hide()`; explicit hiding remains separate from viewport/intersection culling and survives refresh, resketch, resize, and scroll; mount descriptions, arrow labels, and sticky text detach and restore only their owned ARIA IDs; foreign and later-added IDs survive; arrow/sticky expose complete handles; destroy and post-destroy calls are harmless.
- Commands and exit status: worker `npm run agent:generate` — exit 0; final `npx vitest run tests/stet.test.ts` — exit 0, 38 passed; final `npm run check` — exit 0; final `npm run test:browser -- tests/browser/scroll.spec.ts --project=chromium` — exit 0, 6 passed; final `git diff --check` — exit 0.
- Browser/manual artifacts: targeted Chromium scroll/visibility behavior passed; no snapshot or generated visual artifact changed.
- Pre-existing failures: none encountered.
- Unverified items and reason: no additional browser engines or full browser suite were required by the task's targeted verification.
- Reviewer decision: APPROVE after four in-scope coverage gaps were fixed: hide while culled then un-cull, foreign/later ARIA for arrow and sticky, distinct settled `show()` promises, and fixture cleanup. Follow-up review found no remaining in-scope defects.
