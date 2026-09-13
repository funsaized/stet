# AGENT-02 — Add canonical motion recipes
## Outcome
Agents use real static, show, hide, replay and cancellation-aware APIs in every framework. **Parent:** F2. **State:** BLOCKED.
## Prerequisites
AD-INTEGRATE, CORE-05, and BOX-02 accepted. This task is the final planned writer
of shared snippet/pattern sources before AGENT-01 audits them.
## Required reading
Agent snippets/patterns, adapter/runtime contracts and template checker.
## Allowed edits
`agent/snippets.mjs`, `agent/patterns.mjs`, relevant tests; templates only through generation.
## Exact change
Generate static, hidden, reveal, replay and host-code sequencing examples using `onHandle` where applicable.
## Acceptance criteria
Cancelled sequence stops; reduced motion/cleanup included; no group/timeline API invented.
## Verification
`npm run check`, `npm run test:agent`, `npm run test:templates`, relevant pattern tests.
## Forbidden scope
Hand-edited templates, new orchestration schema, commit/push/publish.
## Stop conditions
Stop if one framework cannot demonstrate the accepted contract.
## Review evidence
Compiled generated examples and behavior cases.
