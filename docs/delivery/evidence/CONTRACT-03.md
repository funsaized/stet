# CONTRACT-03 evidence

- Revision/base: `7279869d68c09829de08b36cd74633e9dd63c0db`; CONTRACT-01 is ACCEPTED.
- Files changed: `docs/delivery/contracts/playwright.md`, task/backlog state, and this evidence file; no product, package, or generated files.
- Implementation/package inspection: root exports and TypeScript build, package export/peer/side-effect declarations, packed-consumer assertions, Playwright 1.63 configs and Chromium/Firefox/WebKit gating, browser fixtures, workflows, and PW-01 through PW-08 task boundaries.
- Acceptance criteria checked: `createStet(Page | Frame)`, session primitives, asynchronous complete remote handles, exact Node/runtime cancellation distinction, non-waiting target snapshot/races, same-document and same-origin-frame rules, permanent navigation invalidation, disposal/rollback ownership, stable public error codes, and unsupported contexts are explicit.
- Package boundary: the contract adds an optional type-only `@playwright/test >=1.63 <2` peer and a supported package subpath; consumer esbuild, CDN assets, core Playwright/Node imports, automatic reinjection, cross-document arrows, and silent CSP bypass are excluded.
- Commands and actual outcomes: documentation/source/config inspection and repository searches only. No implementation check was run because the entry does not yet exist; BASE-01 records current Playwright/browser/package checks.
- Evidence-gated detail: exact renderer transport, stylesheet transport, loader-resource lifetime, and CSP-vs-load detection remain exclusively for PW-01/PW-02 evidence. This contract specifies outcomes without choosing `addScriptTag`, `addStyleTag`, bundling, inline content, or another mechanism.
- Unverified items: all helper runtime/package behavior remains implementation evidence for PW tasks; no CSP support claim is made.
- Reviewer decision: ACCEPT after independent review confirmed the API/error/ownership contract and that loader mechanics remain PW-01/PW-02-gated.
