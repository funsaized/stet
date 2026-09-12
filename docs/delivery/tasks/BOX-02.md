# BOX-02 — Publish box everywhere
## Outcome
Box is complete across runtime, adapters, agent contracts, templates, and package. **Parent:** C1/F1. **State:** BLOCKED.
## Prerequisites
BOX-01 and AD-INTEGRATE accepted.
## Required reading
All primitive exports/adapters, `agent/catalog.mjs`, generators, package checks.
## Allowed edits
Primitive/index/adapters, catalog/snippet/pattern sources, tests, generated outputs via generation.
## Exact change
Add named box symbols and static/animated plan support following existing primitive
patterns, and register box in the CORE-02 reveal-support mechanism.
## Acceptance criteria
Export cardinality, tree-shaking, adapter imports, schema validation and packed consumers pass.
## Verification
`npm test`, `npm run check`, `npm run test:templates`, `npm run test:package`, targeted browser test.
## Forbidden scope
Universal factory, direct generated edits, other primitives, dependencies, commit/push/publish.
## Stop conditions
Stop if any framework cannot expose the agreed symbol without redesign.
## Review evidence
Public surface matrix, generated diff, commands.
