# SHIP-03 evidence

- Published user recipe: `docs/shipping.md`; indexed from root and documentation READMEs.
- Published agent rule: `agent/skills/stet/references/shipping.md`; linked from the base Stet skill.
- Claim-to-test map:
  - literal `off`/`preview`/`local` policy and sole dynamic boundary → `tests/shipping/fixture/config-base.mjs`, config files, and `src/stet/review-boundary.ts`;
  - production/preview/local/disabled/mixed rendering and native behavior → `tests/shipping/runtime.spec.ts` in Chromium and Firefox;
  - packed-package runtime/content exclusion, mixed retention, complete manifests/chunks/assets, hidden and published decoded maps → `tests/shipping/prepare.mjs` and `inspect-output.mjs`;
  - named failure evidence → deliberate `leak.txt` case in `inspect-output.mjs`.
- Scope language: docs explicitly reject environment-flag-only/runtime-only checks, no-op/hidden exclusion claims, source rewriting, and an unproven plugin. Disabled, runtime, and content guarantees are separate. Other bundlers, SSR, copy/deployment tooling, and pipelines require equivalent evidence.
- Verification: `npm run test:agent` exited `0` (9 files, 64 tests); `npm run test:templates` exited `0` (40 snippets, zero Svelte diagnostics); `node tests/shipping/inspect-output.mjs` exited `0` and still identified the deliberate leaking asset.
- Reviewer decision: ACCEPT after independent review; an initial request to clarify the source-map boundary exception, app-owned paths, and disabled scope was corrected and re-reviewed.
