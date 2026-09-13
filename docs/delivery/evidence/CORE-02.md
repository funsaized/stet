# CORE-02 evidence

- Revision/base: `dc0d56f`
- Environment: Linux 7.2.3-arch1-3 x86_64; Node v26.7.0; npm 11.19.0
- Files changed: `src/mount.ts`, `agent/catalog.mjs`, `scripts/agent/generate.mjs`, `tests/stet.test.ts`, `tests/agent/schema.test.ts`, and generated `agent/annotation-plan.d.ts`, `agent/capabilities.json`, `agent/schemas/annotation-plan.schema.json`, `agent/schemas/capabilities.schema.json`, and `agent/validate.generated.mjs`.
- Acceptance criteria checked: flat animation options are public; animation defaults off; supplied timing opts in unless `animate:false`; enabled values resolve to 600ms duration and 0ms delay; supplied timing must be finite and nonnegative; only circle and underline accept enabled reveal; every unsupported primitive fails before DOM/ARIA mutation; generated plan validation follows the same support and timing rules.
- Commands and exit status: worker and final `npm run agent:generate` — exit 0; final `npx vitest run tests/stet.test.ts tests/agent/schema.test.ts` — exit 0, 84 passed; final `npm run check` — exit 0; final `git diff --check` — exit 0.
- Browser/manual artifacts: not applicable; CORE-02 contains validation only and forbids animation rendering.
- Pre-existing failures: none encountered.
- Unverified items and reason: no browser check required because this task adds no rendering behavior.
- Reviewer decision: APPROVE after correcting advertised supported-primitive defaults to include `animate:false`; follow-up review found no remaining in-scope defects.
