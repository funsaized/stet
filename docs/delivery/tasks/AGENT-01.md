# AGENT-01 — Keep generated contracts current
## Outcome
The complete first-release surface has matching installed agent facts. **Parent:** F1. **State:** BLOCKED/final audit.
## Prerequisites
AGENT-02, PW-03 and AGENT-03 accepted. Public tasks still generate their owned artifacts
when required; this task audits the integrated result after the final shared
generator writer.
## Required reading
`agent/catalog.mjs`, `scripts/agent/generate.mjs`, schema/drift tests and changed API.
## Allowed edits
Catalog/generator/snippet sources, focused tests, generated outputs via generation.
## Exact change
Represent released primitives/options/defaults/restrictions; keep adapter callbacks out of plans.
## Acceptance criteria
Runtime and plan validation agree; package export checks remain valid; old plans have explicit compatibility.
## Verification
`npm run check`, `npm run test:agent`, `npm run test:templates`, `npm run test:package` as relevant.
## Forbidden scope
Hand-edited generated files, speculative timeline schema, commit/push/publish.
## Stop conditions
Stop if generator cannot express an approved public type.
## Review evidence
Source and generated diff with drift results.
