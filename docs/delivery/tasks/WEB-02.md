# WEB-02 — Add equal first-success paths
## Outcome
“Write it yourself” and “Ask your agent” reach the same released result. **Parent:** G2. **State:** BLOCKED.
## Prerequisites
FIX-02, AGENT-02 and HANDOFF-01 accepted.
## Required reading
Quickstart/navigation/copy components and approved examples.
## Allowed edits
Website/docs first-success paths and direct tests.
## Exact change
Add parallel starts covering CSS, cleanup, motion choice, and source-versus-injection.
## Acceptance criteria
Mobile CTA available; all commands/snippets release-correct; both paths converge visibly.
## Verification
Fresh consumer, `npm --prefix website run check`, and
`npm --prefix website test` for mobile/keyboard/navigation.
## Forbidden scope
Separate agent product/funnel, unsupported claims, commit/push/publish.
## Stop conditions
Stop if either path cannot be reproduced from package assets.
## Review evidence
Path completion and command results.
