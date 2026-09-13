# AGENT-02 evidence

- Revision/base: `d6fd6e7`
- Source writers: `agent/snippets.mjs`, `agent/patterns.mjs`; templates regenerated through `npm run agent:generate` only.
- Recipes: static primitive snippets plus a hidden animated box and sequential public-handle `hide`, awaited `show`, awaited `replay`, and final `hide`. A cancelled show or replay returns immediately. Reduced motion is delegated to the accepted runtime; framework cleanup/destroy cancels active work.
- Adapter handles: React uses stable `useCallback`; Vue and Svelte include `onHandle` as adapter metadata; Angular binds `stetOnHandle`; vanilla receives the handle directly.
- Commands and exit status: `npm run test:agent` — 0 (63 passed); `npm run check` — 0; `npm run test:templates` — 0 (40 generated assets); `npm run test:patterns` — 0 (18 passed: Chromium and Firefox); formatter/lint — 0.
- Generated status: every checked-in template matched generator output; callback metadata remained absent from capabilities and plan schemas.
- Reviewer decision: APPROVE; cancellation, cleanup, reduced-motion guidance, idiomatic callbacks, and no invented orchestration API were confirmed.
