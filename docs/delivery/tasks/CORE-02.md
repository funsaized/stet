# CORE-02 — Validate animation options

## Outcome
Runtime and plans agree on flat options, inferred opt-in, defaults, and supported primitives.
## Parent
B2/F1. **State: BLOCKED.**
## Prerequisites
Accepted CORE-01.
## Required reading
Runtime contract, generator/catalog, schema/drift tests, primitive attach paths.
## Allowed edits
Runtime validation, catalog/generator sources, relevant tests, generated outputs through generation.
## Exact change
Add options and an explicit reveal-support check for circle/underline. Reject
invalid numbers or unsupported animated primitives before mutation. BOX-02 extends
the same support check when box becomes public.
## Acceptance criteria
`animate:false` overrides timing; defaults are accurate; runtime/plan validation agree; no nested option type.
## Verification
Focused runtime and agent schema tests, `npm run check`.
## Forbidden scope
Animation rendering, schema hand edits, generator object support, commit/push/publish.
## Stop conditions
Stop if generated contracts cannot express approved semantics without a contract change.
## Review evidence
Validation table and generated diff.
