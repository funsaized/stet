# CONTRACT-03 — Finalize Playwright API

## Outcome
Exact helper, remote-handle, ownership, navigation, frame, and error contracts.
## Parent
D1. **State: BLOCKED.**
## Prerequisites
Accepted CONTRACT-01.
## Required reading
Playwright contract, package exports/checks, Playwright configs and existing browser fixtures.
## Allowed edits
`docs/delivery/contracts/playwright.md` and evidence only.
## Exact change
Specify `createStet(Page|Frame)`, primitive calls, result methods, target races, document ownership, cleanup, and error taxonomy.
## Acceptance criteria
No loader assumption; normal cancellation differs from browser failure; unsupported contexts are explicit.
## Verification
Independent contract and package-boundary review.
## Forbidden scope
Injection implementation, CSP claims without evidence, commit/push/publish.
## Stop conditions
Stop if API depends on unknown PW-01/PW-02 results; leave only that mechanism evidence-gated.
## Review evidence
Final signatures, errors, and acceptance matrix.
