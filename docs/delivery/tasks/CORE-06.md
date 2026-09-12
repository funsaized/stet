# CORE-06 — Compose reveal and ambient motion

## Outcome
Reveal, boil, hover resketch, reduced motion, and capture settle coherently.
## Parent
B5. **State: BLOCKED.**
## Prerequisites
Accepted CORE-05.
## Required reading
Runtime contract motion rules, `src/rough.ts`, mount, CSS, reduced-motion/hover/browser tests.
## Allowed edits
Shared motion/render code, CSS and focused tests.
## Exact change
Implement one composition policy without variant flashes or implicit replay.
## Acceptance criteria
Live reduced-motion settles finished; hover does not replay; offscreen timing matches contract; deterministic capture is possible.
## Verification
Focused Vitest and browser tests for media, hover, scroll and stable capture.
## Forbidden scope
New ambient effects, new options, budget changes, commit/push/publish.
## Stop conditions
Stop if preserving current boil requires changing the approved API.
## Review evidence
Behavior matrix and visual artifacts.
