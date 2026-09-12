# SHIP-02 — Inspect excluded output
## Outcome
Output scans falsify runtime/content exclusion claims. **Parent:** E4. **State:** BLOCKED.
## Prerequisites
SHIP-01 accepted.
## Required reading
Shipping contract, fixture outputs, manifest/source-map formats.
## Allowed edits
Output-inspection script and positive/negative fixtures.
## Exact change
Scan JS, CSS, assets, reachable chunks and published maps for review sentinels and unused Stet.
## Acceptance criteria
Mixed mode keeps only intended content; failure names offending asset; stale output cannot mask result.
## Verification
Passing fixture plus deliberately failing sentinel case.
## Forbidden scope
Disabling source maps globally without contract, brittle filename assumptions, commit/push/publish.
## Stop conditions
Stop if emitted format cannot support a reliable scan without narrowing the guarantee.
## Review evidence
Artifact inventory and scan results.
