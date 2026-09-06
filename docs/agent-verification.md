# Agent-first v1 verification

Verified on 2026-09-06. Local environment: Linux, Node 26.7.0, npm 11.19.0.
CI uses Ubuntu 24.04 and native Windows; development compilers run on Node 22,
while the shipped CLI is tested separately on Node 20.0.0 and 24.

V1-01–07 now have engineering and actual-model evidence. V1-08 provides the
concrete release handoff; merge, the proposed version and publication remain a
separate maintainer decision. The authorized trials used an existing ChatGPT
login, without a new paid API integration. The branch version remains unchanged.

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

The initial isolated proposed 0.1.0 review artifact measured 646,338 B compressed /
1,143,788 B unpacked, 169 files (before the final documentation reconciliation).
The refreshed final artifact manifest is `.release-artifacts/proposed/pack.json`;
exact archive/hash evidence and the retained initial artifact are documented in
agent-release-handoff.md. This is installation/disk growth, not
browser transfer. Test fonts and harnesses are not runtime dependencies.

Plans establish structure and authoring constraints, not DOM uniqueness, truthful
copy, visibility or accessible usability. Source/browser review remains required.
Cross-document targets, top-layer dialogs, transformed/zoomed document roots,
partial clipping and collision-perfect placement remain unsupported/limited as
before. Real screen readers, broader real-device matrices and historical framework
versions are optional follow-ups, not claims made by automated tests.

## Evidence by item

The following records retain failures and recovery, including intermediate run
counts. The current table above is authoritative for completion status. Foundation
verification through acda814 was 74 unit tests, 28 browser tests and 20 demos; those
historical results did not establish the additional v1 acceptance criteria.

## V1-01 — contract hardening (2026-09-06)

Node 26.7.0 / Linux: `npm run agent:generate`, `npm run test:agent`
(39 tests), `npm run check`, `npm run test:package` pass. Additional
`npx vitest run tests/agent/drift.test.ts tests/stet.test.ts` passes 23 tests,
including isolated deliberate export/type/default mutations and observable runtime
default parity. Subprocess checks required sandbox escalation after EPERM.
Bounded malformed mutations cover roots, fields, annotations, nonfinite parsed
numbers and hostile property names. Schema CSS rationale now matches the existing
semantic requirement; valid authoring plans are unchanged. Diagnostic inventory
and evolution policy are in agent-usage.md. Packed CLI/types pass; consumer has
zero required dependencies and browser bundles remain 3,387 / 4,957 B gzip.

## V1-02 — recoverable installation (2026-09-06)

The previous implementation replaced content before its manifest and used fixed
exclusive temporary filenames: an interrupted update could make its own content
look locally edited or fail with EEXIST. The new journal records old/new ownership
and manifest state, with a shared-path lock and token-owned staging files.
`npm run test:agent` passed 46 tests; the subsequently added abrupt-process-exit
case passed with all seven `tests/agent/install.test.ts` tests. Faults at prepared,
staged, written and committed boundaries recover; edits after interruption,
unknown owners and malformed recovery records remain explicit conflicts.
An actual child exit leaves a lock/journal which the next invocation recovers.
Existing symlink/local-edit/manifest CLI regressions and `npm run test:package`
pass (Linux, Node 26.7.0, subprocess escalation). Packed browser sizes remain
3,387 / 4,957 B gzip, with zero required dependencies. No runtime files changed.

## V1-03 — lifecycle patterns (2026-09-06)

The old Vue/Svelte arrow factory gated the host on destination readiness. It now
keeps the control mounted. Five generated `lifecycle` patterns cover multiple
marks, enable/disable, destination absent/ready/replaced/removed and teardown.
`npm run test:templates` passes all 35 assets; `npm run test:agent` passed 47 tests
before the additional partial-group rollback test, which passes separately.
`node scripts/agent/build-patterns.mjs && npx playwright test -c
playwright.patterns.config.ts` passes 10 Chromium/Firefox cases executing canonical
code, with preserved control identity, focus, click/submit behavior, descriptions
and observer cleanup. Screenshots are under `test-results/pattern-runs/`; the
React Chromium narrow-screen screenshot was inspected. An initial test wrongly
expected arrow label association on the source; runtime inspection established
that the destination is described and assertions now check both associations.
`npm run test:package` passes including all five pattern lookups. Angular browser/
server test packages are development-only additions. Runtime code/CSS and packed
browser bundle sizes remain unchanged. WebKit/SSR expansion is tracked in V1-06.

## V1-04 — project discovery and starting plan (2026-09-06)

`npm run test:agent` passes 56 tests; `npm run check` and `npm run test:package`
pass on Linux / Node 26.7.0. Eight project tests cover all five frameworks,
nested/hoisted installations, multiple frameworks, absent dependencies, malformed
manifests, source evidence, deterministic JSON and no script execution/writes.
The packed consumer discovers its actual installed binary/version and validates
the generated settings example. A deliberate type mutation now fails even earlier
at example validation; the drift test records that expected diagnostic.
Discovery implementation is verified. The bounded decision against `plan init`
uses the bundled adaptable example; its task-trial evidence is recorded with
V1-05 rather than being inferred from schema success.

## V1-06 — browser and SSR expansion (in progress)

`node scripts/agent/build-patterns.mjs && npx playwright test -c
playwright.patterns.config.ts` passes 18 Chromium/Firefox cases: five lifecycle
patterns and four SSR/client cases per engine. React/Vue/Svelte hydrate the exact
server DOM without replacing the control or reporting mismatches; Angular has
server rendering followed by client attachment (not a claim of Angular hydration).
All server renders run without browser globals or premature annotations. Tests
cover update/unmount, preserved native descriptions, focus, clicks/submission,
arrow destination replacement, narrow layouts and disconnected observers.
Initial failures in generated Angular server HTML and the Vue hydration harness
were fixed; application runtime code was unchanged. Supported Ubuntu WebKit
execution and inspected new snapshots are pending the branch CI run. The optional
AT walkthrough is in agent-accessibility-walkthrough.md; no real screen-reader
session has been claimed. Docker daemon access is unavailable on this host.

## V1-07 — consumer/CI gate expansion (in progress)

The new `npm run test:cli-consumer -- <tarball>` uses no development dependencies
and exercises the installed bin, schemas, all primitive/pattern snippets, example,
project discovery, shared/all-tool installers, local-edit protection and symlink
conflicts. Local Node 26.7.0/Linux passes with zero required dependencies.
CI now builds one verified tarball, then tests it on Node 20.0.0 (the CLI floor)
and Node 24 on native Linux and Windows. Development compilers remain on Node 22;
the browser package has no newly imposed engine requirement. Results remain
pending until those jobs run. Generated drift checks precede all regeneration;
reference/docs/example path filters and browser/SSR failure artifacts are covered.

V1-06 supported-host investigation: Ubuntu run `34040959863` executed WebKit;
22/27 pattern+SSR cases passed, with only five missing new snapshots failing.
The five candidate images have identical SHA-256
`ce03950efe1e26a83a3a4e3ca433558754d3ff9b605bc58058d86639e638e7eb`;
the React representative was inspected before committing them. The older browser
suite exposed host font substitution and consequent label-width failures. Tests
now load bundled OFL Liberation fonts (test-only, with license), preserving the
existing strict screenshot and label-clearance assertions. All six refreshed
Chromium/Firefox visual baselines were inspected; no runtime/CSS behavior changed.
`npx playwright test tests/browser/visual.spec.ts --update-snapshots` passed 18
checks; normal comparison and Ubuntu reruns follow. Local WebKit launch remains
blocked by missing libicu74/libxml2/libflite; no privileged desktop changes made.

V1-07 native matrix: run `34041094325` passed verify and all four packed consumer
jobs on Ubuntu/Windows with Node 20.0.0 and 24. The browser job remained red for
the separately recorded V1-06 font/snapshot work; it was not treated as a green
release gate.

## V1-05 — harness and nonblind development evidence

Prepared nine isolated tarball apps with separate prompts/scoring; all five
unannotated framework apps pass their actual compiler/build checks. The primary
implementer's React settings trial passed plan/compiler/native-control/lifecycle
checks but failed screenshot review on its first attempt; the reduced one-mark
version passes both. Source, plans, prompt, screenshots and honest classification
are committed under `docs/evidence/v1-05/nonblind-react/`. See agent-evals.md.
At this earlier development stage, fresh routing and tasks had not run because
additional-agent authorization was pending. The subsequent explicit authorization
and actual trials below resolve that blocker. The earlier nonblind result remains
separate; no synthetic output is relabeled as actual model behavior.

Final V1-01 review added an exact annotation-object diagnostic for null/array/
scalar entries (rather than asking for a primitive inside a non-object).
`npm run test:agent` passes 58 tests with this and the V1-02 follow-up below;
`npm run test:package` passes, with unchanged runtime bundles and zero dependencies.

Final V1-02 review found a check/replace race between two stale-lock contenders.
A short acquisition gate now serializes reclamation; an interrupted gate is a
precise preserved conflict. The new regression plus existing active-owner and
abrupt-process-exit tests pass. This avoids claiming that a token recheck alone
provides an atomic compare-and-replace operation.

Ubuntu run `34041408340` passed all 27 lifecycle/SSR cases. The original browser
suite passed all 33 non-snapshot checks, including short-arrow clearance after
font pinning. Remaining snapshot differences include platform symbol-font/raster
output (54 pixels in the Chromium specimens image), so strict Ubuntu 24.04
reference images are kept separately from local Linux references; no tolerance
was increased. Six Ubuntu Chromium/Firefox images and two WebKit images were
visually inspected. WebKit forced-color review found the example application's
dark surfaces did not switch to Canvas; the example now explicitly owns that
surface adaptation. Local 18 visual checks still pass without baseline updates.
The corrected WebKit forced-color image awaits inspection from the next run.
Browser/demo output directories now preserve other suites' evidence artifacts.

Run `34041816671` passes all 27 lifecycle/SSR cases and 41/42 original-browser
cases; the only failure is the intentionally absent final WebKit forced-color
reference. Reviewing that candidate confirmed readable annotations on Canvas
surfaces and revealed one light native section caption, now also set to CanvasText
by the example application. The final reference will be accepted only after that
caption correction is rendered on the supported runner.

## Final supported-host gate

[Run 34042217795](https://github.com/funsaized/stet/actions/runs/34042217795)
is green: 95 unit/agent tests, 35 compiled assets, packed-consumer/size checks,
42 Chromium/Firefox/WebKit browser cases, 27 lifecycle/SSR cases, and four native
Linux/Windows × Node 20.0.0/24 consumer jobs. All new visual references were
inspected; strict assertions were retained. This closes V1-06 and V1-07's
engineering gates, not V1-05's actual-model evidence requirement.
The subsequent empty-flag CLI fix passes its nine subprocess tests and packed
consumer check; its branch CI is also monitored before handoff.

## V1-08 — documentation and release preparation

README keeps the human quick start first. The guide, architecture, changelog and
backlog now describe final discovery/recovery/lifecycle behavior and the exact
model-evidence blocker. The fresh installed-tool walkthrough in the nonblind
React consumer passes project inspection, schema/pattern lookup, plan validation,
compiler/browser checks and idempotent skill update. The source/screenshot recovery
is retained rather than erased. An isolated proposed 0.1.0 archive also passes
build and packed-consumer checks, while the branch version remains 0.0.2.
The concrete proposal, draft release notes and existing release commands are in
agent-release-handoff.md. The subsequent actual-model evidence completes the
V1-05 prerequisite. Version/merge/publication approval remains separate from the
completed engineering handoff.


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
remain unchanged. The current proposed archive's exact size, files and integrity
are recorded beside it as described in the release handoff.


The maintainer's coredump report identifies a repeated Chromium startup SIGTRAP
from `SandboxHostLinux::Init()` after `shutdown()` returned `EPERM`; the precise
outer-sandbox cause remains inferred. These startup failures are separate from
application results. Authorized browser runs outside the command sandbox pass;
no desktop package/configuration change or upstream issue was made. The supplied
report and its provenance are retained in the evaluation environment note.

Post-trial local gates pass: 95 unit/agent tests, generated drift/type checks,
35 compiled templates, real tarball consumers and size budgets. That archive
measured 649,867 B compressed / 1,155,108 B unpacked with 172 files before the final
handoff update. It excludes raw trial evidence; browser bundles remain 3,387 /
4,957 B gzip. The refreshed proposed 0.1.0 artifact is measured separately.
