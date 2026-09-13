# BASE-01 — Record the baseline

## Outcome
Reproducible revision, environment, test, browser, and size evidence before implementation.
## Parent
A1, A5, H2. **State: ACCEPTED.**
## Prerequisites
None.
## Required reading
`package.json`, lockfile, test configs, workflow files, `scripts-size.mjs`.
## Allowed edits
One evidence summary under `docs/delivery/evidence/`; no product files.
## Exact change
Record revision/tree changes, Node/npm versions, browser availability, current checks, and payload measurements. Separate code failures from environment failures.
## Acceptance criteria
A later task can attribute new failures; every unavailable check is explicit; unrelated failures remain unchanged.
## Verification
Run the existing commands appropriate to the installed environment and record exact status.
## Forbidden scope
Fixing failures, installing tools, changing snapshots/budgets, commit/push/publish.
## Stop conditions
Stop if a command would mutate dependencies or overwrite evidence.
## Review evidence
Command transcript summary, environment, pre-existing failures, unverified checks.
