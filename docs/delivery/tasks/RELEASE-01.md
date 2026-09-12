# RELEASE-01 — Run the full release gate
## Outcome
All required behavior is verified as an integrated package. **Parent:** H2. **State:** BLOCKED.
## Prerequisites
CONTRACT-05, FIX-01/02, MEASURE-01, CORE-01 through CORE-08, all AD tasks,
BOX-01/02, PW-01 through PW-08, SHIP-01 through SHIP-03, AGENT-01 through
AGENT-03, HANDOFF-01, WEB-01/02, and DOCS-01 accepted. RELEASE-01 and RELEASE-02
are not their own prerequisites.
## Required reading
All contracts, task evidence, release workflow/docs and candidate diff.
## Allowed edits
Only fixes dispatched as separate bounded tasks and release evidence.
## Exact change
Run unit/type/generation/template/package/framework/SSR/browser/Playwright/exclusion/size/manual visual matrix.
## Acceptance criteria
No skipped check called pass; package/docs agree; initial failures remain visible; known limits recorded.
## Verification
All commands listed in `README.md`, including
`npm --prefix website run check` and `npm --prefix website test`, plus manual
animation review.
## Forbidden scope
Publishing, blanket snapshots, hidden budget changes, opportunistic fixes, commit/push.
## Stop conditions
Any required check fails or is unavailable.
## Review evidence
Exact revision, commands, artifacts and independent decision.
