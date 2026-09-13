# CONTRACT-04 evidence

- Revision/base: `7279869d68c09829de08b36cd74633e9dd63c0db`; BASE-01 and CONTRACT-02 are ACCEPTED.
- Files changed: `docs/delivery/contracts/shipping.md`, task/backlog state, and this evidence file; no product/build implementation.
- Implementation/package inspection: root and website package metadata, `sideEffects`, TypeScript/Vite configs, SSR entry, package test/bundle checks, shipping task packets, and current source usage of build/runtime environment flags.
- Acceptance criteria checked: production, preview-only, local-only, disabled, and mixed modes name exact module owners, policy/command selection, literal build constant, browser outcome, emitted JS/CSS/assets/manifest outcome, and external/hidden/inline/no-source-map treatment. Production imports remain outside the review boundary in mixed mode.
- Falsifiability: unique production/review code/copy/plan/CSS sentinels are scanned in every emitted artifact, manifest/module graph, and published source map; disabled behavior, runtime exclusion, and content exclusion have separate acceptance checks.
- Unsupported scope: runtime-only flags, no-op/hidden annotations as exclusion proof, scattered temporary content, static review imports, copied public assets, universal AST/text stripping, unproven plugins/other bundlers, CDN loading, and website aliases are not claimed.
- Commands and actual outcomes: documentation/config/package inspection and searches only. No fixture build was run because SHIP-01 creates the bounded Vite fixture and SHIP-02 proves packed output; BASE-01 records current package/website builds.
- Unverified items: emitted-output guarantees remain proposed until SHIP-01/SHIP-02 evidence runs them against the packed package and selected source-map settings.
- Reviewer decision: ACCEPT after independent review resolved source-map needles, required map modes, mixed/SSR coverage, and mode-qualified runtime exclusion.
