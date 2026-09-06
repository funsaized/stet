# Agent-first v1 verification

Verified locally on 2026-09-06 with Node.js 26.7.0 / npm 11.19.0 on Linux.
The added CI workflow uses Node.js 22. No npm publication or version bump was
performed; maintainers should choose a release version and regenerate artifacts
through the normal build before publishing.

## Results

| Check | Result |
| --- | --- |
| `npm test` | 74 tests pass: 36 existing, 37 agent tests, one runtime-default consistency test |
| `npm run check` | TypeScript, Angular and generated artifact drift checks pass |
| `npm run build` | Runtime/adapters compile and agent artifacts regenerate |
| `npm run size` | 6,951 B core / 1,138 B CSS gzip; unchanged from baseline |
| `npm run test:browser` | 28 Chromium/Firefox tests pass; existing visual baselines unchanged |
| `npm run test:demos` | 20 tests pass across five frameworks, desktop/mobile and both engines |
| `npm run test:templates` | All 30 snippets pass TypeScript, Angular strict templates, Vue and Svelte checks |
| `npm run test:package` | Actual tarball installation, local bin, schemas, 30 snippets, skill install/update, runtime imports, exports and packed declaration positive/negative checks pass |
| `npm pack --dry-run` | Intended assets included; no publishing performed |
| Skill creator format validator | All four skills pass |
| Offline eval fixtures | 21 entry-route prompts; per-skill positives/negatives generated from one source; synthetic scorer checks pass |
| `git diff --check` | Pass |

CLI tests execute help/version, inspect, both schemas, snippets, valid and invalid
files, strict usage errors, JSON stability and all four installers. They exercise
initial conflicts, local edits, deleted managed files, invalid manifests,
symlinks, repeat installs and updates from a simulated earlier managed version.
Schema fixtures cover unknown primitives, malformed targets/counts/options,
missing sticky text, invalid mark kind, unsupported framework/version, blank text,
unknown fields, duplicate IDs and unjustified structural CSS. General schema
validation is cross-checked against the generated standalone validator.

The sandbox blocked captured child-process output with EPERM. Subprocess/package
and browser checks were rerun with the needed execution permissions. The initial
package bundle-test harness also incorrectly imported the development bundler
inside the dependency-free consumer; that test-only error was fixed and the
consumer check passed. No runtime fixes or screenshot baseline changes were needed.

## Runtime and package impact

No files under src/ and no CSS were changed. Browser gzip budgets remain 7 KB core
and 3 KB CSS. Core measurements use the existing concatenated-unminified-file
method; do not compare them directly with minified bundler measurements.

The packed-consumer esbuild check produces 3,387 B gzip for circle-only and
4,957 B for all core exports (including its console-use harness). Its module graph
contains no agent infrastructure or Node builtins. The smaller single-primitive
bundle confirms unused primitives still shake out. CSS sideEffects metadata and
all existing exports remain intact. React/Vue/Angular optional peer ranges are
unchanged; Svelte still needs no runtime import in its adapter.

The baseline tarball was 483,672 B compressed / 656,097 B unpacked (85 files).
The agent layer and docs increase this to approximately 516 KiB compressed /
913 KiB unpacked. This is install/disk size, not browser transfer. Generated
standalone validation, schemas and canonical templates account for much of the
increase. The exact pack metrics are printed by the package test. The isolated
consumer installs no required dependencies beyond Stet itself. Ajv, esbuild and
Vue/Svelte checkers are development dependencies only; the generated validator
ships with Ajv's MIT notice.

## Final review

**Human developer:** Existing attachers, handles, adapters, stylesheet, semantics
and lifecycle are untouched. The quick start remains first in README. Plans and
the CLI are optional. No renderer refactor was needed.

**Coding agent:** Local inspection provides installed identity, exports, option
schemas/defaults, target arity/type, framework export symbols and constraints.
The base skill routes into source targeting, framework lifecycle and recovery.
Use-case skills teach judgment. Plans reject unsupported APIs before edits, and
all canonical snippets are checked against the real adapters. Application checks
and browser verification remain explicit after plan validation.

**Maintainer:** Existing TypeScript option interfaces/MarkKind remain authoritative.
Generation checks runtime symbol names and target arity, emits schemas/types/
capabilities/validator/templates, and generates trigger fixtures. Runtime tests
compare advertised defaults with observable drawings/placement. Catalog metadata
contains behavioral interpretation rather than importing agent code into core.
The new CI checks committed generated artifacts before builds can rewrite them.

## Limits and deferred work

- Structural plan validity cannot establish real DOM identity, selector uniqueness,
  truthful consequences, CSS validity, framework readiness or accessible usability.
  Targets are source-editing evidence; there is no runtime target resolver.
- Supplied text must be nonblank in plans, while the runtime remains permissive.
  TypeScript declarations cannot express all schema/semantic constraints.
- No real remote-model trigger or task-success evaluation was run. Fixture/scorer
  tests establish integrity and coverage, not proven model performance gains.
- WebKit, real screen readers and full SSR/hydration/version matrices were not
  added. Existing placement limits remain, including top-layer and document-root
  transforms, partial clipping and annotation collisions.
- Skill installation is preflighted and individual writes are atomic, but it is
  not a cross-file transaction or concurrent-editor locking system. Reconcile
  interrupted/conflicting updates. Obsolete assets are retained rather than deleted.
- The initial implementation did not include project discovery, real model task
  trials or the expanded browser/SSR matrix. The updated
  [execution backlog](agent-backlog.md) now makes bounded versions of that work
  required v1 polish; these results do not claim that work is complete. AST apply,
  a Stet-owned MCP server and operational engines remain outside v1.

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
No synthetic routing output is reported as actual model behavior. Fresh routing
(21 queries) and nine task sessions, including the ordinary-docs baseline, are
unrun. A session instruction requires explicit delegation before additional agents;
the requested authorization remains pending. Existing Codex CLI 0.153.2 reports a
ChatGPT login; no new paid model usage or additional agent has been started.
This remains a precise v1 release blocker, not a passing/deferred trial result.

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
