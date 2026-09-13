# AGENT-03 evidence

- Base: PW-06 and SHIP-03 accepted.
- Delivery decision: the base Stet skill now routes durable/published or non-Playwright annotations to application source, temporary screenshot/test artifacts with a caller-owned supported Playwright context to injection, and temporary in-app review content to the tested source boundary.
- Ambiguity: the skill asks one precise lifetime/artifact/context question rather than silently choosing. It states unsupported cross-origin/opaque or detached frames, workers, browser contexts, locator/FrameLocator contexts, element handles, cross-document arrows, navigation/frame-detachment reuse, restrictive CSP, and unclaimed WebKit.
- Boundaries: both delivery paths require independent native behavior/accessibility/cleanup verification. The skill says Stet does not run agents, perform QA, apply plans, edit source automatically, contact users, publish, or deploy.
- Routing fixtures: added a durable published onboarding case (`stet-explain-ui`), temporary Playwright injection case (`stet`), ambiguous lifetime case (`stet` for clarification), and negative Playwright-without-Stet case (`none`). `npm run agent:generate` refreshed canonical per-skill trigger evaluations.
- Verification: `npm run test:agent` exited `0`: 9 files and 64 tests passed, including routing, skill integrity, generated drift, installer, schema, and CLI checks.
- Reviewer decision: ACCEPT after independent review; requested clarifications for branch-specific implementation/recovery and the exact Playwright context matrix were corrected and re-reviewed.
