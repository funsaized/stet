# BOX-02 evidence

- Revision/base: `d6fd6e7`
- Public surface: vanilla `box`, React `Box`, Vue `vStetBox`, Svelte `box`, Angular `StetBoxDirective`.
- Runtime: `box()` uses accepted `roughBox` geometry, the existing mount/update handle, and the shared stroked reveal state machine. Default padding is 5. Static is default; validated animation settings use the next entrance.
- Agent surface: catalog, capabilities, plan schema/types/validator, CLI snippets, and all five framework templates were regenerated from source. Box is reveal-supported in runtime and plan generation; callback metadata remains excluded.
- Commands and exit status: `npm test` — 0 (332 passed); `npm run check` — 0; `npm run test:templates` — 0 (40 snippets/patterns); `npm run test:patterns` — 0 (18 passed); `npm run test:package` — 0; focused browser reveal suite — 0 (72 passed across Chromium/Firefox); focused runtime/agent tests — 0 (237 passed).
- Package result: 720,552-byte archive; 1,461,735 unpacked bytes; 279 files; zero consumer runtime dependencies; circle-only 4,645 gzip bytes vs full 6,529, confirming tree-shaking.
- Generated diff: box templates added for vanilla, React, Vue, Svelte, and Angular; capabilities/schema/type/validator outputs changed only through `npm run agent:generate`; subsequent `agent:check` passed.
- Reviewer decision: APPROVE; no confirmed runtime, schema, adapter, or packaging defect.
