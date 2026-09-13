# AGENT-01 provisional evidence

- Revision/base: `d6fd6e7`
- Scope decision: the integrator temporarily waived PW-03 and AGENT-03 on 2026-09-13. This audit covers the current runtime, adapters, box, and motion surface only. AGENT-01 must reopen after those prerequisites are accepted.
- Audit matrix: seven runtime primitives match catalog and generated core exports; all five framework symbol maps match adapter exports; option schemas/defaults derive from TypeScript and catalog; box/circle/underline reveal support matches runtime and plan validation; adapter callback metadata is absent from plans; generated artifacts match sources.
- Compatibility: an explicit test keeps version-1 plans using the original circle, underline, highlight, arrow, sticky, and mark primitives valid.
- Corrected drift: generated lifecycle constraints now list `show()`, `hide()`, and `replay()` in addition to refresh, resketch, and destroy.
- Commands and exit status: `npm run check` — 0; `npm run test:agent` — 0 (64 passed); `npm run test:templates` — 0 (40 compiled); `npm run test:package` — 0 (zero runtime dependencies; circle/full 4,645/6,529 B gzip); focused runtime/schema tests — 0 (228 passed).
- Generated status: `agent:check` passed after regeneration; generated files were not edited manually.
- Reviewer decision: APPROVE PROVISIONAL with no current-surface blocker. Generated TypeScript/capability option bags remain intentionally broader than conditional JSON-schema validation; runtime and executable plan validation agree.
- Deferred full-audit scope: PW-03 package/Playwright exports, AGENT-03 installed skills/routing, and resulting full-release generated-contract drift.
