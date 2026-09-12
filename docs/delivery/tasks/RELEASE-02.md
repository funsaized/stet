# RELEASE-02 — Freeze public proof to the artifact
## Outcome
Website/examples consume the actual candidate artifact. **Parent:** A1/G1/G2. **State:** BLOCKED.
## Prerequisites
RELEASE-01 accepted candidate artifact.
## Required reading
Website/package release configs and release evidence.
## Allowed edits
Stable website/example dependency configuration and corresponding checks.
## Exact change
Remove checkout-only stable aliases and bind version/capabilities/snippets to the artifact.
## Acceptance criteria
Website result reproduces in fresh consumer; agent capabilities and displayed version agree.
## Verification
Website build/test and packed consumer.
## Forbidden scope
Publishing, feature changes, commit/push.
## Stop conditions
Stop if candidate artifact lacks any advertised public proof.
## Review evidence
Artifact checksum/version and reproduction.
