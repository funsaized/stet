# FIX-02 — Canonicalize installation

## Outcome
One tested scoped-package, CSS, ESM, CLI, and Node installation path.
## Parent
A6. **State: BLOCKED.**
## Prerequisites
Accepted FIX-01.
## Required reading
README, install/agent docs, package metadata, CLI consumer check, website install copy.
## Allowed edits
Installation prose/tests and directly corresponding website copy.
## Exact change
Distinguish scoped install from local `stet` binary and CLI Node from website-development Node requirements.
## Acceptance criteria
Every command has context and is exercised by a fresh consumer.
## Verification
`npm run test:package`, `npm run test:cli-consumer` with the documented artifact.
## Forbidden scope
Renaming package/binary, changing Node floors without evidence, commit/push/publish.
## Stop conditions
Stop if existing release artifacts cannot support the chosen instructions.
## Review evidence
Canonical sequence and consumer outcomes.
