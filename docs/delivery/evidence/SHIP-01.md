# SHIP-01 evidence

- Base: PW-01 through PW-08 accepted.
- Environment: Linux; Node `v26.7.0`; npm `11.19.0`; Vite `7.3.6`; Playwright `1.63.0`.
- Packed consumer: `funsaized-stet-0.1.0.tgz`, 742,187 bytes, 301 files, installed offline under ignored `test-results/shipping/consumer`.
- Boundary: ordinary Vite module imports only. `production.ts` owns intentional Stet imports/copy; `review.ts` owns temporary imports/copy/plan/CSS; `review-boundary.ts` is the sole dynamic importer and uses the literal build-time boolean. Configs pass literal `off`, `preview`, or `local` policies to a validated config helper. No plugin, source rewriting, or runtime flag.
- Builds exercised: production customer; preview customer and `stet-preview`; local customer; disabled; mixed customer and `stet-preview`. All enable manifests and hidden source maps. Vite development servers exercise local-only and mixed-local policies.
- Runtime result: `npx playwright test -c playwright.shipping.config.ts` exited `0`: 18 tests passed in 11.7s across Chromium and Firefox. Production rendered only intentional marks; preview customer/local build rendered none; explicit preview rendered temporary marks; disabled rendered none; mixed customer retained only intentional marks; mixed preview and mixed local development rendered both. Every mode preserved native button behavior.
- Disabled qualification: zero rendered overlays is the disabled guarantee only; no exclusion/privacy claim is inferred from that runtime result.
- Static checks: modified TS/JS/MJS files passed `oxfmt` and `oxlint`; `npm run check` exited `0`.
- Output content, graph, asset, and decoded source-map scans are intentionally deferred to SHIP-02.
- Reviewer decision: ACCEPT after independent review found no SHIP-01 blocker and confirmed all contracted mode/runtime fixtures.
