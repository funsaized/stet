# Agent-first v1 verification

Verified on 2026-09-06. Local environment: Linux, Node 26.7.0, npm 11.19.0.
CI uses Ubuntu 24.04 and native Windows; development compilers run on Node 22,
while the shipped CLI is tested separately on Node 20.0.0 and 24.

V1-01–08 are complete. The maintainer authorized the 0.1.0 version, merge and
publication on 2026-09-06. The authorized trials used an existing ChatGPT login,
without a new paid API integration. Release procedure: [releases.md](releases.md).

## Current results

| Check | Result |
| --- | --- |
| `npm test` | 95 tests pass, including 58 agent checks |
| `npm run check` | TypeScript, Angular and generated drift checks pass |
| `npm run build` | Core/adapters compile and canonical agent artifacts regenerate |
| `npm run size` | 6,951 B core / 1,138 B CSS gzip; 7 KB / 3 KB budgets unchanged |
| `npm run test:templates` | All 35 primitive/lifecycle assets compile across five frameworks |
| `npm run test:package` | Actual archive installation, CLI, types, exports, assets and browser graph pass |
| `npm run test:browser` | 28 local Chromium/Firefox cases pass with inspected test-font baselines |
| `npm run test:demos` | 20 cases pass across five frameworks and desktop/mobile |
| `npm run test:patterns` | 18 local cases; Ubuntu passes all 27 including WebKit and SSR/client checks |
| Native packed CLI matrix | Ubuntu/Windows × Node 20.0.0/24 pass |
| Ubuntu original-browser suite | All 42 pass with inspected strict platform baselines |
| Actual fresh agent evaluation | 21/21 routing before and after fixes; nine initial tasks, two fresh reruns, separate guided baseline recovery; final 27 plan/layout/browser checks pass |
| Nonblind development trial | React plan/compiler/browser pass; initial visual failure and correction retained |

Subprocess and browser checks require execution outside this host's subprocess-
restricted sandbox. Local WebKit lacks libicu74/libxml2/libflite; supported Ubuntu
CI executes it instead. No privileged desktop package changes were made.

## Runtime/package impact and boundaries

`git diff 2be12b4 -- src style.css` is empty. The public runtime/adapters and CSS
retain their behavior, imports and size. Required runtime dependencies remain
zero; optional peers stay Angular >=20 <22, React >=18 <20 and Vue >=3 <4.
Circle-only/full packed browser bundles remain 3,387 / 4,957 B gzip and contain
no agent infrastructure or Node builtins. Smaller circle-only output confirms
unused primitives still shake out. Angular SSR/browser packages are dev-only.
The visual specimen application explicitly adapts its own forced-color surfaces;
it does not change Stet's ownership of application UI.

Agent assets increase installed package size, not browser transfer. Test fonts,
harnesses and raw model evidence are excluded from the published package. The
release includes its exact npm archive and SHA-256 checksum as GitHub assets.

Plans establish structure and authoring constraints, not DOM uniqueness, truthful
copy, visibility or accessible usability. Source/browser review remains required.
Cross-document targets, top-layer dialogs, transformed/zoomed document roots,
partial clipping and collision-perfect placement remain unsupported/limited as
before. Real screen readers, broader real-device matrices and historical framework
versions are optional follow-ups, not claims made by automated tests.

## Completed backlog

| Item | Commits |
| --- | --- |
| V1-01 | `9522651`, `b9e628a` |
| V1-02 | `f8b1e91`, `bdb1798` |
| V1-03 | `f2867bb` |
| V1-04 | `01bfc37`, `ecc816e` |
| V1-05 preparation/nonblind evidence | `b72d7a7` |
| V1-05 actual trials, corrections and replay | `2d82339` |
| V1-08 initial handoff | `6813934`, `760d307`; final handoff `df61ca6` |
| V1-06 | `340d9b4`, `05fcd86`, `c712c62`, `5fb605d`, `ccb0595` |
| V1-07 | `0a256e1` |

The completed planning backlog and one-time release handoff were retired during
0.1.0 cleanup; their full history remains in Git. Ongoing usage, architecture,
evaluation and release instructions remain maintained.

## Authorized actual-model evaluation

Codex CLI 0.153.2 used the existing ChatGPT login, configured model `gpt-6-astra`
and medium reasoning. An immutable backend model snapshot was not exposed. Both
actual routing batches pass 21/21. Nine original fresh-context task sessions cover
the five frameworks, review, showcase, arrow recovery and the React ordinary-docs
baseline; all prompts, raw events, session IDs, source diffs, plans, check output
and screenshots are linked from [agent-evals.md](agent-evals.md).

The original review changed control dimensions to fit notes; an explicit comparison
against the pristine app reproduces the failure. A focused skill correction and
fresh rerun preserve layout. The first arrow's label obscured a native warning;
the fresh rerun uses an accessible description and verifies browser behavior.
Its thin path still crosses intervening warning text, which remains readable in
the inspected result. No collision-free routing or complete accessibility claim
is made. The ordinary-docs baseline originally supplied a prose plan; a separate
guided public-type follow-up adds valid JSON without changing UI source. These
failures and recoveries are retained, not counted as first-attempt successes.

All nine final application sources compile. The final trial matrix passes 27/27:
nine source/plan checks, nine pristine desktop/mobile layout comparisons and nine
browser interaction/lifecycle cases. Source and screenshot review are separate.
Fresh-context does not mean strictly blind: installed package documentation was
available. Small-sample results do not establish general agent performance.

The model-free artifact replay also passes 27/27. It prepares new consumers and pristine references,
restores retained edits and recompiles them; it is reproducibility evidence, not
another agent trial. Raw evaluation files remain outside the npm package under
`tests/trials/evidence/v1-05/fresh`. Runtime source, CSS, dependencies and budgets
remain unchanged. The release archive is verified independently through the packed-consumer gate.


## Supported-host evidence

[Implementation CI](https://github.com/funsaized/stet/actions/runs/34053224385)
and [handoff CI](https://github.com/funsaized/stet/actions/runs/34053515519) pass
the complete library and native consumer matrix. Release metadata receives the
same checks before publication.

The maintainer’s Chromium coredump report identified a startup SIGTRAP after
`shutdown()` returned `EPERM`; the outer-sandbox cause remains inferred. Browser
checks outside the command sandbox pass. The supplied report is retained with
the evaluation evidence; no desktop configuration or package changes were made.
