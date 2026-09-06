# Agent-first Stet: GPT Astra execution backlog

Updated 2026-09-06 after the initial implementation was committed and pushed as
`acda814` on `agent-first`. The foundation is implemented and locally verified.
The polish work below is **planned, not implemented**. Earlier verification is
recorded in [agent-verification.md](agent-verification.md); do not reinterpret it
as evidence that the new acceptance criteria already pass.

## Working instructions for GPT Astra

You are the primary implementer. Own investigation, design decisions, code,
fixtures, tests, documentation, failure recovery and preparation for release.
The human should not have to translate this backlog into engineering tasks.

1. Read the item's affected files and current repository instructions. Check git
   status and preserve unrelated edits. Use installed source, manifests and tests
   as factual authority; verify external tool behavior when it matters.
2. Reproduce the problem or establish the missing acceptance test. Choose the
   smallest complete solution. Do not reopen finished work without evidence.
3. Implement, run the narrow checks, fix failures, and update canonical sources
   plus generated outputs. Avoid unrelated runtime changes.
4. Verify the acceptance criteria and record exact commands, results, environment
   and artifact paths. Update the status only when that evidence exists.
5. Keep changes reviewable by item. Follow the session's commit/push authorization;
   never infer permission to merge, publish or incur new paid usage from this file.
6. If one step needs unavailable access, complete all independent preparation and
   other items. Record the exact blocker and smallest human action that resolves
   it. Do not silently label a failed or unrun check as passing or deferred.

**Ask the human only for** unresolved product intent that affects the actual UI,
unavailable credentials/access or a new spending decision, genuinely privileged
host changes, optional hands-on assistive-technology feedback, and release/merge
approval when not already authorized. Routine implementation choices, fixture
creation, browser automation, analysis and debugging belong to you.

Do not require the human to hand-author plans, manually copy skills, run normal
checks, write eval scaffolding or diagnose failures you can inspect yourself.
Treat a capability limitation as a constraint to work around where possible,
not as a reason to move the entire item out of v1.

## Scope and execution order

The initial P0 contract is complete. A polished v1 additionally requires V1-01
through V1-08. These items promote useful portions of the former P1 work into the
release rather than deferring them wholesale.

| Order | Item | Status | Depends on |
| --- | --- | --- | --- |
| 1 | V1-01 Contract and diagnostic hardening | Verified | F-01, F-02 |
| 2 | V1-02 Recoverable skill installation | Verified | F-03 |
| 3 | V1-03 Safe lifecycle patterns | Ready | F-04, F-05 |
| 4 | V1-04 Evidence-based project discovery and plan example | Ready | V1-01 |
| 5 | V1-05 Actual agent routing and implementation trials | Ready for harness work | V1-01–04 for final trials |
| 6 | V1-06 Browser, accessibility and SSR verification | Ready for harness work | V1-03 for final template checks |
| 7 | V1-07 Consumer and CI release gates | Ready for harness work | V1-01–06 for final run |
| 8 | V1-08 Documentation, evidence and release handoff | Ready for incremental updates | V1-01–07 for completion |

This order is a default sequence for one agent, not a request for an orchestration
system. Continue an independent item when a prerequisite is externally blocked.
No new command is justified solely by appearing in an earlier proposal.

## Completed foundation: per-item maintenance instructions

### F-01 — Required agent contract (original P0 contract)

**Status:** Complete in `acda814`.
**Problem/solution:** API guessing is constrained by a typed plan, TS-derived
option schemas, installed capabilities and a standalone validator.
**Areas:** `src/mount.ts`, `src/primitives.ts`, `agent/catalog.mjs`,
`scripts/agent/generate.mjs`, `agent/schemas/`, `agent/index.d.ts`.
**Dependencies:** Source/API audit in [architecture](agent-architecture.md).

When extending this contract, GPT Astra:

1. Change runtime types only when the actual public API changes. Put agent-only
   interpretation in the catalog; never import the catalog into runtime modules.
2. Extend generation and fixtures together. Preserve plan version 1 compatibility
   unless an incompatible authoring change is deliberately justified.
3. Generate artifacts, check export names/arity/defaults and verify packed types.

**Acceptance/evidence:** Six primitives, five frameworks, required fields and
actual imports are exposed; schema/type/default checks passed. Reverify changes
with `agent:generate`, `agent:check`, relevant tests and `test:package`.
**Human involvement:** Only for a proposed breaking public contract decision.
**Next work:** V1-01; do not recreate this layer.

### F-02 — Small CLI (original P0 CLI)

**Status:** Complete in `acda814`.
**Problem/solution:** Installed facts and plan validation are available through
inspect/schema/validate/snippet, with JSON, help/version and stable exit classes.
**Areas:** `agent/cli.mjs`, `agent/validate.mjs`, `tests/agent/cli.test.ts`.
**Dependencies:** F-01.

When modifying the CLI:

1. Define input/output/error behavior before adding a flag or command.
2. Exercise the actual subprocess in both human and JSON modes; reject ambiguous
   or unsupported arguments instead of guessing.
3. Verify the command from an installed tarball and update help/usage together.

**Acceptance/evidence:** Existing subprocess tests pass, including strict usage,
invalid files, structured diagnostics and repeated JSON output.
**Human involvement:** None for ordinary CLI work.
**Next work:** V1-01 and the bounded addition in V1-04.

### F-03 — Skill installation (original P0 installation)

**Status:** Complete initial behavior; interruption recovery remains V1-02.
**Problem/solution:** One canonical skill set installs into documented project
paths with checksummed ownership and local-edit protection.
**Areas:** `agent/install.mjs`, `agent/catalog.mjs`, CLI/install tests.
**Dependencies:** F-02, F-04.

When changing installation:

1. Preserve shared `.agents/skills` behavior for Codex/Cursor/OpenCode and the
   Claude path. Recheck official discovery paths if a tool changes.
2. Preserve unrelated configuration and divergent user content. Test all writes
   in temporary projects, including symlink and ownership conflicts.
3. Exercise init, repeat init and update through the packed binary.

**Acceptance/evidence:** Four tools, idempotence and conflict preflight pass.
**Human involvement:** Access only when an actual destination requires it; no
permission round-trip for ordinary authorized project setup.
**Next work:** V1-02 closes the documented cross-file failure gap.

### F-04 — Skills (original P0 skills)

**Status:** Complete structural implementation; behavioral evidence remains V1-05.
**Problem/solution:** A concise operational router and three use-case skills
separate API facts from annotation judgment.
**Areas:** `agent/skills/`, `agent/evals/routing.json`, `docs/agent-evals.md`.
**Dependencies:** F-01, F-02, F-05.

When refining skills:

1. Identify a demonstrated routing or implementation failure, then edit the
   smallest relevant description/reference rather than adding generic warnings.
2. Add positive and neighboring negative cases to the canonical routing fixtures.
3. Regenerate per-skill fixtures and verify links, installed paths and affected
   behavior. Preserve the Action → Verify → Recover workflow.

**Acceptance/evidence:** Four format-valid skills, valid relative references and
21 covered entry-route prompts. Offline checks do not prove model triggering.
**Human involvement:** Only for genuinely ambiguous product intent in a trial.
**Next work:** V1-03–05; no expansion into a large skill catalog.

### F-05 — Framework templates (original P0 templates)

**Status:** Complete 30 primitive/framework snippets; lifecycle coverage expands
in V1-03.
**Problem/solution:** Agents can adapt actual API examples for every adapter.
**Areas:** `agent/snippets.mjs`, generated `agent/templates/`, framework references,
`scripts/agent/check-templates.mjs`.
**Dependencies:** F-01.

When adding a pattern:

1. Edit the canonical factory, not generated copies. Retain the real controls'
   layout, attributes, handlers and presence throughout the example.
2. Typecheck the result with its framework compiler, then test lifecycle behavior
   where static checking cannot establish correctness.
3. Verify snippet lookup and tarball inclusion.

**Acceptance/evidence:** All 30 existing snippets pass TS/Angular/Vue/Svelte checks.
**Human involvement:** None for standard patterns.
**Next work:** V1-03, especially ready/missing/replaced arrow destinations.

### F-06 — Packaging (original P0 packaging)

**Status:** Complete initial packed-consumer gate.
**Problem/solution:** An actual tarball consumer catches absent files, unusable
exports, missing dependencies and browser bundle contamination.
**Areas:** `package.json`, `scripts/agent/check-package.mjs`, library CI.
**Dependencies:** F-01–05.

When changing shipped artifacts:

1. Update files/exports/bin only as needed, and assert every intended asset ships.
2. Install the archive into an isolated consumer using normal optional-peer
   resolution. Exercise CLI, types and runtime imports from that installation.
3. Inspect browser bundle inputs, tree shaking, dependencies and size separately
   from package disk size.

**Acceptance/evidence:** Packed checks pass; browser imports exclude agent code;
zero required dependencies and optional framework peer ranges are preserved.
**Human involvement:** Publication approval only when actually publishing.
**Next work:** V1-07 extends environments and makes gates harder to bypass.

### F-07 — Documentation and verification (original P0 docs and verification)

**Status:** Complete initial implementation record.
**Problem/solution:** README keeps the human quick start first and documents the
separate agent layer, measured costs and known limits honestly.
**Areas:** README, `docs/agent-*.md`, changelog, package scripts.
**Dependencies:** F-01–06.

When updating the record:

1. Keep package identity and installed-version lookup accurate. Avoid hard-coded
   current-version claims that generation or package metadata can supply.
2. Record the checks actually run, rather than copying old passing counts.
3. Distinguish implementation completion, release readiness and publication.

**Acceptance/evidence:** Initial full suite: 74 tests, 28 browser tests, 20 demo
tests; build/check/size/templates/pack passed. Source runtime and CSS unchanged.
**Human involvement:** Final product/release decisions only.
**Next work:** V1-08; earlier passes do not waive new acceptance criteria.

## Required v1 polish

### V1-01 — Make authoring errors and contract evolution predictable

**Problem:** Schema errors can be technically correct but hard to act on; semantic
rules and schema structure need an explicit relationship. Capability/default
metadata must not silently drift as source changes.
**Solution/areas:** Harden the current validator/generator and diagnostic tests;
keep the existing CLI and browser runtime boundary.
**Dependencies:** F-01, F-02. **Status:** Verified; see V1-01 evidence in agent-verification.md.

GPT Astra, implement in this order:

1. Inventory every current diagnostic code and test malformed roots, annotation
   objects, options, target fields, duplicate IDs and unsupported versions.
   Inspect branch filtering to ensure every invalid input stays invalid.
2. For each failure, identify the exact corrective action. Add focused messages
   naming the primitive, accepted values or missing field; suppress irrelevant
   union-branch noise. Preserve codes/paths for existing consumers where practical.
3. Put constraints expressible in standard JSON Schema there when compatible.
   Keep genuinely semantic checks separate and document differences. Do not imply
   JSON Schema can prove DOM identity or TypeScript can encode all constraints.
4. Extend table-driven parity tests and bounded generated JSON cases, including
   hostile property names and nonfinite numeric results from JSON parsing.
5. Verify capability source checks and add regression coverage for a deliberately
   changed export/type/default. Specify plan-version evolution and how incompatible
   installed versions are diagnosed; do not build a migration engine.
6. Regenerate, update diagnostic documentation and run agent tests, check and pack.

**Acceptance:** Every invalid fixture produces a stable, actionable path/code;
no false-success branch filtering; explicit schema/semantic boundary; old valid
v1 plans remain valid unless an intentional tightening is documented and reviewed.
**Verification:** Fixture/parity tests, generated drift tests, packed CLI/types.
**Human:** Only if a necessary change rejects previously valid authoring plans.

### V1-02 — Recover safely from interrupted skill updates

**Problem:** Current per-file writes are atomic, but the manifest is written last.
An interruption can leave mixed versions or stale temporary files that a retry
cannot safely distinguish from local edits.
**Solution/areas:** Add the smallest recoverable installation protocol in
`agent/install.mjs`, plus fault-injection tests and recovery guidance.
**Dependencies:** F-03. **Status:** Verified; see V1-02 evidence in agent-verification.md.

1. Reproduce failure after a content write, before manifest replacement and with
   an existing temporary file. Capture exactly what a subsequent update does.
2. Design explicit preparation, write, commit and recovery states. A small local
   journal or staged manifest is sufficient; avoid a generic transaction library.
3. Acquire an installation lock if overlapping invocations can corrupt those
   states. Distinguish an active operation from stale state without assuming that
   a PID alone proves ownership. Recheck expected file hashes before replacement.
4. Record enough old/new ownership information to resume safely. Preserve local
   edits and unrelated files, including edits made after interruption. Clean up
   only temporary artifacts positively owned by this operation.
5. Inject failures at each state boundary and test retry, conflicts, simultaneous
   invocations, shared tool paths, symlinks and malformed recovery records.
6. Return explicit structured recovery diagnostics and update documentation. Keep
   destructive force-overwrite absent; retain obsolete files unless separately
   justified by an explicit safe migration policy.

**Acceptance:** A retry either completes the interrupted update or names a precise
conflict without losing local data. No mixed state is reported as success. Normal
init/update remain deterministic and idempotent.
**Verification:** Temporary-project failure tests and packed install/update smoke.
**Human:** Only to resolve genuinely conflicting human edits after you prepare
an exact diff; never ask them to debug the protocol.

### V1-03 — Canonical patterns for persistent controls and changing targets

**Problem:** The small arrow samples gate a sample host on destination readiness.
Blind adaptation could hide an application's real control. Conditional/multiple
annotations currently depend heavily on prose.
**Solution/areas:** Extend the template factory and relevant framework references
with a small lifecycle pattern set, then execute those patterns in tests.
**Dependencies:** F-04, F-05. **Status:** Ready.

1. Define behavior for annotation enable/disable while controls remain present,
   multiple marks, a missing/replaced arrow destination and component teardown.
2. Implement a minimal example for each framework using existing adapters where
   sufficient and core lifecycle handles where necessary. Do not invent adapter
   options or add wrappers that take ownership of controls.
3. Centralize cleanup; ensure partially attached groups are destroyed on failure.
   Preserve seeds across deliberate reattachments where reproducibility matters.
4. Make patterns discoverable through the existing snippet surface, using a
   bounded pattern selector only if needed. Keep single-primitive lookup stable.
5. Add framework execution tests for enable → disable → enable, destination
   absent → ready → replaced → removed and final unmount. Assert native controls
   stay usable and no overlays/descriptions/subscriptions leak.
6. Typecheck all generated patterns and include them in the packed artifact gate.

**Acceptance:** Every framework has a copyable, verified path for these common
lifecycles. Missing annotation targets never require removing a real control.
**Verification:** Compiler checks, lifecycle tests, V1-06 browser coverage, pack.
**Human:** None unless the requested product intentionally changes control presence.

### V1-04 — Discover project evidence and ship a usable plan starting point

**Problem:** Framework selection and locating the installed binary are still
manual reasoning steps; a vague task benefits from concrete source evidence.
**Solution/areas:** A read-only `inspect --project <directory>` extension (or a
smaller equivalent justified during implementation), generated plan example,
CLI/schema tests and targeting guidance. No new doctor or runtime selector engine.
**Dependencies:** V1-01. **Status:** Ready.

1. Build fixtures for vanilla, each framework, nested workspaces, hoisted Stet,
   multiple frameworks, missing dependencies and malformed manifests.
2. Inspect only bounded project manifests and relevant configuration/source
   evidence. Do not execute package scripts, traverse all dependencies or install
   anything during discovery.
3. Report candidate frameworks, evidence paths, installed package/binary location
   and relevant declared check commands as data. Distinguish declared dependencies
   from a resolvable installed version; do not silently select among ambiguities.
4. Preserve inspect's existing capability payload. Add a structured project
   result with deterministic ordering, documented limits and actionable errors.
5. Ship a schema-validated settings-screen plan example with clearly illustrative
   source targets and correct mark/arrow variants. Route skills to adapt actual
   source evidence; never manufacture refs or treat the example as a resolved plan.
6. Use V1-05 trials to decide whether a `plan init` command adds value. Prefer the
   bundled example if it solves the problem; record that as a completed decision,
   not an indefinitely deferred command.

**Acceptance:** Unambiguous fixtures yield accurate evidence; ambiguous projects
remain explicitly ambiguous. Discovery has no application mutations or execution.
The agent can locate the installed tool and produce a valid source-evidenced plan.
**Verification:** Project fixtures, read-only assertions, CLI JSON tests, pack.
**Human:** Only when source evidence cannot resolve which application/framework
within a real multi-app request is intended; present the narrowed alternatives.

### V1-05 — Measure real agent behavior and fix observed failures

**Problem:** Fixture integrity and a synthetic scorer do not demonstrate actual
skill selection or successful Stet implementation by an unfamiliar agent.
**Solution/areas:** A local task/eval harness, small fixture apps, real routing
results and task artifacts; refine existing skills from observed failures.
**Dependencies:** Harness can start now; final trials use V1-01–04.
**Status:** Ready for harness work. Actual model runs are required v1 evidence,
while paid-model PR CI remains optional.

1. Prepare isolated apps and acceptance checks for: the vague dangerous-settings
   request in all five frameworks; a visual review; a product showcase; and
   recovery from an invalid option plus a missing arrow destination. Reuse apps
   across scenarios instead of building a demo catalog.
2. Separate task prompts from expected answers and scoring. Provide the installed
   package/skills and ordinary app source, not solution patches or fixture labels.
3. Run all canonical routing prompts with real model responses. Record exact
   model/session identity, settings, prompts, artifacts and errors. Never label
   a session blind if it inherited the solution or this implementation history.
4. Use an available authorized coding-agent session for end-to-end tasks. Record
   nonblind development trials separately; use a fresh trial context when available
   for release evidence. Do not require a new provider integration to begin.
5. Score concrete outcomes: real targets, truthful copy, valid plan, supported API,
   preserved semantics, correct cleanup, passing app checks and visible result.
   Compare at least the React settings task with an ordinary-docs baseline, using
   equivalent initial apps and task conditions; report raw results, not broad
   performance claims from a tiny sample.
6. Diagnose failures, improve only the relevant skill/template/diagnostic, then
   rerun the affected case plus neighboring routing negatives. Keep failed trial
   artifacts as evidence; do not tune the scorer to excuse failures.
7. Publish a concise result table with links to reproducible artifacts. Keep the
   ordinary CI suite offline and model-free.

**Acceptance:** All 21 entry-route prompts have actual responses and scored results.
Canonical positive routes and unrelated negative controls must pass on the chosen
release-evaluation model after fixes. Every listed task scenario must complete
without invented APIs, changed control semantics or unreported check failures.
A failure stays open; a human can explicitly accept a documented release exception.
**Verification:** Existing scorer plus application/compiler/browser assertions;
raw trial records distinguish synthetic, nonblind and fresh-context results.
**Human:** Only for unavailable authenticated access, a fresh session you cannot
create, or new paid usage. Prepare prompts, harness and exact bounded request first;
do not hand off implementation or manual scoring to the human.

### V1-06 — Browser, accessibility and SSR confidence for the agent patterns

**Problem:** Compiler checks do not prove browser lifecycles or hydration safety.
WebKit was unavailable on the development host, and model-written safety copy
needs verified accessible associations and working controls.
**Solution/areas:** Small browser fixtures for generated patterns, supported-host
WebKit execution and framework SSR/hydration smoke tests. Use existing Playwright
infrastructure; do not introduce MCP or alter placement merely to expand scope.
**Dependencies:** Harness can start now; final pattern checks depend on V1-03.

1. Render the canonical lifecycle patterns with each framework. Verify target
   identity, keyboard focus, clicks, form behavior, description ownership, reduced
   motion, narrow layouts, scrolling and teardown. Include destination replacement.
2. Add server-render → hydrate → update → unmount smoke coverage for React, Vue
   and Svelte and an Angular server/client attachment smoke. Assert no premature
   DOM attachment, hydration mismatch or stale annotation after destruction.
3. Run Chromium/Firefox first. Reproduce WebKit on a supported Ubuntu CI runner
   or available container with Playwright's required libraries; avoid privileged
   changes to the human's desktop when CI can solve the problem.
4. Inspect generated screenshots before adding WebKit baselines. Separate known
   unsupported placement contexts from failures in supported examples; do not
   loosen visual assertions or redefine browser support just to get green checks.
5. Add accessible-description assertions for dangerous actions, notes and arrows.
   Confirm native warnings/confirmations remain the application's responsibility.
6. Prepare a short optional real-screen-reader walkthrough and screenshots. Run
   it yourself if the environment supports meaningful interaction; otherwise offer
   the human a focused review of a ready-to-run page, not environment setup work.

**Acceptance:** All five frameworks pass the rendered lifecycle checks; the listed
SSR/client smoke checks pass; WebKit passes on a supported host with inspected
baselines. No automated result is described as a full accessibility certification.
**Verification:** Playwright results/screenshots, SSR logs and cleanup assertions.
**Human:** Privileged access only if no supported host alternative exists; optional
hands-on AT feedback. Full real-device/AT/version permutations remain follow-up,
not a reason to defer this bounded v1 matrix. An unavailable required environment
is an explicit blocker, not a silently skipped passing job.

### V1-07 — Enforce the contract through real consumers and CI

**Problem:** Local success alone does not protect future releases; new patterns,
project discovery and recovery assets must ship and remain isolated from runtime.
**Solution/areas:** Extend package/template tests and `.github/workflows/library.yml`
with bounded environment coverage and independently reproducible commands.
**Dependencies:** Final run after V1-01–06; scaffolding can start earlier.

1. Add every new runtime/agent export, pattern, reference, schema and example to
   actual tarball-consumer assertions. Exercise the published declaration entry
   with both valid examples and expected TypeScript failures.
2. Test the CLI on the declared minimum Node version and one current supported LTS,
   checking engine requirements of development tools separately from the shipped
   CLI. Do not unnecessarily raise browser consumers' engine requirement.
3. Cover native filesystem semantics on Windows in a bounded CLI/install job if
   runners are available. Keep symlink tests explicit about host capabilities;
   do not claim tested cross-platform behavior from Linux alone.
4. Keep generated drift checks before build regeneration. Add the bounded browser
   and SSR checks from V1-06 to CI with useful failure artifacts. Ensure PR path
   filters include changed canonical inputs and relevant reference/example files.
5. Recheck zero required dependencies, unchanged optional peers, actual browser
   input graphs, tree shaking, core/CSS budgets and package disk growth.
6. Run the workflow-equivalent sequence locally where supported; inspect the
   authorized branch/PR's CI results and fix failures. Do not merge to test a gate.

**Acceptance:** A fresh checkout can reproduce the release checks; packed consumers
receive every advertised artifact; no generated drift or browser dependency leak;
required CI checks pass on their declared environments.
**Verification:** npm check/test/build/size, templates, package, browser/SSR jobs,
Node/OS matrix results and tarball manifest.
**Human:** Repository access or unavailable runner permissions only. No normal test
execution or dependency debugging delegated to the human.

### V1-08 — Finish the documentation and prepare a concrete release decision

**Problem:** A polished library needs one accurate workflow and an honest record
of what agents can now do, not a list of prospective capabilities.
**Solution/areas:** README, agent guide, architecture, changelog, verification,
backlog status and the repository's existing release process.
**Dependencies:** Incremental updates throughout; final completion after V1-01–07.

1. Walk the exact fresh-consumer path: install scoped package → install skills →
   inspect project/capabilities → plan → validate → snippet/pattern → source edit →
   build/browser verification → recover. Fix every undocumented or guessed step.
2. Rewrite references around final behavior. Remove obsolete deferral language
   and duplicate facts; keep the human installation/tiny example first.
3. Record measured runtime/package costs and exact local/CI/model evidence. Explain
   known unsupported contexts and actual exceptions without overclaiming results.
4. Review from human developer, unfamiliar coding agent and maintainer perspectives.
   Close every required item with evidence or leave its exact blocker visible.
5. Prepare a proposed release version, release notes and the existing release
   commands. Rebuild and pack the proposed artifact when authorized; verify the
   generated identity matches the chosen version. Do not publish a second artifact
   under the already published 0.0.2 version.
6. Present the human with the small final decision: release/merge approval if not
   already given, plus any explicit exception that still prevents the normal gate.
   After approval, execute the authorized release steps and verify the installed
   published artifact rather than merely reporting the publish command succeeded.

**Acceptance:** Documentation reproduces actual shipped behavior; V1-01–07 are
verified or any release exception is explicitly accepted; release is concrete and
reviewable. Publication is a separate authorized action, not inferred from backlog
completion. **Verification:** Fresh consumer walkthrough and final result table.
**Human:** Product exception/release/version decisions only when unresolved or not
already authorized; you prepare and execute the engineering work.

## Former P2 items: bounded decisions, not an expanding deferred queue

### D-01 — Plan → source apply (original P2 source apply)

**Decision:** No AST rewriting engine in v1. The useful work is source-editing
reliability, which is required in V1-03 and V1-05.
**Problem/areas:** Mechanical edits might help some repeated failure; relevant
areas would be agent templates and a separate build-time helper, never core.
**Dependencies:** Actual task-failure evidence from V1-05.

1. Classify any source-edit failures seen in trials.
2. Fix factual discovery, templates or lifecycle guidance first and rerun.
3. Only if the same mechanical failure persists, prepare a narrow one-framework
   prototype proposal with before/after trial results and maintenance cost.

**Acceptance/verification:** V1 tasks succeed through source editing; record the
no-apply decision with evidence. A future helper needs demonstrated benefit and
its own approval/scope, not an open-ended TODO.
**Human:** Only for a proposed expansion beyond the agreed v1 boundary.

### D-02 — Browser/MCP integration (original P2 browser/MCP)

**Decision:** Browser verification belongs in v1; a Stet-owned MCP server does not.
**Problem/areas:** Agents need to inspect and verify live UI. Existing browser
tools and `tests/browser/` can provide this without runtime/server coupling.
**Dependencies:** V1-05, V1-06.

1. Complete inspect → identify target → source edit → screenshot → verify using
   the already available browser tools and application tests.
2. Record a concrete capability gap only if those tools cannot complete a task.
3. Propose an external adapter only when that evidence justifies it; keep core
   imports, package dependency guarantees and the ordinary CLI independent.

**Acceptance/verification:** The v1 end-to-end trials include browser evidence.
No unresolved “MCP later” placeholder substitutes for verification now.
**Human:** Only for new external-service access or a future scope expansion.

### D-03 — Operational/agent engine (original P2 operational engine)

**Decision:** Explicitly excluded, not deferred. No planners, DAGs, datastores,
vaults, memory or orchestration subsystem.
**Problem/solution:** Preserve Stet's annotation-only architecture while adopting
useful machine-readable authoring tools. **Areas:** Dependency and export review.
**Dependencies:** None beyond the original product principle.

1. During each item, reject proposed infrastructure that owns the application's
   UI or agent execution rather than improving annotation correctness.
2. Keep task/eval scripts development tooling; do not ship a general agent runner.
3. Verify runtime imports and dependencies in V1-07.

**Acceptance/verification:** No operational subsystem or required runtime
infrastructure is introduced. **Human:** Only a separate explicit product mandate
could reopen this decision.

## Small remaining follow-up scope

After the required items, follow-up is limited to broader real-device/assistive-
technology and historical-version permutations, optional paid multi-model CI, and
new integrations supported by measured task failures. Optional `plan init` is a
closed evidence-based decision in V1-04, not automatically another backlog item.
Do not add new deferred items simply because an implementation could be more
ambitious. Finish the documented v1 workflows and preserve the small runtime.
