# FOLLOW-07 — Multiline and RTL
## Outcome
Explicit wrapped-text and RTL behavior. **Parent:** C5. **State:** BLOCKED/post-release.
## Prerequisites
Browser-layout investigation and adoption need.
## Required reading
`clientBoxes`, text primitives, RTL browser behavior, plans.
## Allowed edits
Text-layout options/geometry/contracts and focused browser fixtures.
## Exact change
Define single/multiline measurement and reveal direction; state unsupported writing modes.
## Acceptance criteria
LTR/RTL/wrapped/mixed inline cases deterministic and accessible.
## Verification
Real-browser fixtures across supported engines.
## Forbidden scope
Full international typography engine, commit/push/publish.
## Stop conditions
Stop if browser behavior cannot support one documented contract.
## Review evidence
Cross-engine matrix.
