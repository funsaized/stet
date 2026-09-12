# FIX-01 — Align stable website examples

## Outcome
Stable site runtime and copied snippets match the advertised package.
## Parent
A1. **State: BLOCKED.**
## Prerequisites
Accepted BASE-01 and lead-approved parity approach.
## Required reading
`website/vite.config.ts`, `website/src/constants.ts`, `website/src/components/Playground.tsx`, `website/src/showcase/canonical.ts`, website checks.
## Allowed edits
Listed website files and directly relevant website tests.
## Exact change
Remove stable dependence on checkout-only capabilities or isolate a visibly separate preview.
## Acceptance criteria
Stable snippets compile against the displayed release; zero-valued unreleased options cannot leak; labels agree.
## Verification
`npm --prefix website run check`, `npm --prefix website test`, and a fresh
released-package snippet consumer.
## Forbidden scope
Feature work, redesign, package publication, commit/push.
## Stop conditions
Stop if the approved approach requires changing the published package.
## Review evidence
Before/after snippet, package version, commands.
