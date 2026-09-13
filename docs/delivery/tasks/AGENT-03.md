# AGENT-03 — Teach source versus injection
## Outcome
Skills choose delivery by intended lifetime. **Parent:** F3. **State:** BLOCKED.
## Prerequisites
PW-06 and SHIP-03 accepted.
## Required reading
Existing Stet skills, targeting/handoff/verification references, Playwright/shipping contracts.
## Allowed edits
Relevant skill sources, `agent/evals/routing.json`, generated routing evaluations
via the generator, and their tests.
## Exact change
Route durable/published explanations to source and temporary artifacts to injection; surface ambiguity and limits.
## Acceptance criteria
No claim Stet runs agents, edits automatically, or performs QA; unsupported contexts stated.
## Verification
Positive, negative and ambiguous skill/routing fixtures; `npm run test:agent`.
## Forbidden scope
Runtime/helper changes, automatic external actions, commit/push/publish.
## Stop conditions
Stop if delivery choice needs product information absent from the request and no clarification path exists.
## Review evidence
Routing cases and retained outputs.
