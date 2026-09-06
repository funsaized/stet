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
