# Agent-first Stet v1

## Principle and repository analysis

The agent decides what should be annotated. Stet makes representation, API usage,
constraints, and implementation deterministic. The application continues to own
layout, semantics, accessibility, focus, pointer interaction, forms, and lifecycle.

Inspected before implementation: README, historical PRD, tutorial/reference/design
and product-review docs, all nine source modules, CSS, five framework examples,
unit/adapter tests, browser and demo tests, TypeScript/Angular compilation,
package exports/files/peers, size guard, and release/mirror scripts.

The authoritative package is `@funsaized/stet`, currently 0.0.2. Framework names
are export subpaths, not separate packages. README's initial-release statement
and tutorial's hard-coded 0.0.1 archive can mislead; the new layer reads version
and exports from package.json. Old local tarballs are not contract sources.

Six primitives exist: circle, underline, highlight, arrow, sticky, mark. Arrow
requires two Elements; others one. Sticky requires string text. Core mark takes
kind as a separate argument; adapters put it in their props/options. React renders
null and consumes refs; Vue exposes directives only; Svelte actions have no runtime
framework import; Angular uses standalone directives with afterNextRender.

Current source intentionally supersedes these PRD sketches:

| Historical brief | Current implementation |
| --- | --- |
| Hover on, boil 0.3 | Hover off, boil 0; reduced motion observed live |
| Host-prepended chrome | Body overlays; targets remain untouched except descriptions |
| Sticky may intercept pointers | All annotation content ignores pointer events |
| Two-method handles | refresh, resketch, destroy; options snapshotted at attach |
| No requestAnimationFrame | No animation loop; shared frame-batched scroll scheduler |
| Nested scrollers drift | Tracking and visibility implemented; partial clipping remains limited |
| React children / optional Vue components | Explicit React target refs / Vue directives |
| Rough 6 KB core budget | Current enforced 7 KB guard; baseline 6.79 KB gzip |

CSS baseline is 1.11 KB gzip (3 KB guard). Core and adapters have no required
dependencies; React/Vue/Angular remain optional peers. Tests cover seeded geometry, cleanup, accessible descriptions, motion, tracking
and native interaction. The bounded v1 matrix adds five rendered framework
lifecycles, React/Vue/Svelte hydration, Angular server/client attachment and
supported-host WebKit checks; exact run status is in agent-verification.md.
Unsupported placement includes cross-document targets, top-layer dialogs and
transformed/zoomed document roots. Placement is not collision-perfect.

## Comparative reference: Swamp

Reviewed public source at commit `7b11196336e5f67c5f3a81f7938dedede26b406c`
(2026-09-06). Patterns below are adapted conceptually; no Swamp code is copied.

| Swamp evidence | Reliability benefit | Stet decision |
| --- | --- | --- |
| [CLI schema](https://github.com/swamp-club/swamp/blob/7b11196336e5f67c5f3a81f7938dedede26b406c/src/cli/cli_schema.ts) | Discover installed commands rather than recall them | inspect and schema expose installed facts |
| [JSON conformance](https://github.com/swamp-club/swamp/blob/7b11196336e5f67c5f3a81f7938dedede26b406c/integration/json_mode_conformance_test.ts) | Detect human output leaking into automation | Execute every Stet command family in JSON tests |
| [Router skill](https://github.com/swamp-club/swamp/blob/7b11196336e5f67c5f3a81f7938dedede26b406c/.claude/skills/swamp/SKILL.md) | Focused guidance, validate before execution, recover on failure | One small router, framework references, Action → Verify → Recover |
| [Tool directories](https://github.com/swamp-club/swamp/blob/7b11196336e5f67c5f3a81f7938dedede26b406c/src/domain/repo/skill_dirs.ts) | Canonical assets delivered where tools discover them | Project-local install/update with local-edit protection |
| [Skills pipeline](https://github.com/swamp-club/swamp/blob/7b11196336e5f67c5f3a81f7938dedede26b406c/contributing/skills-pipeline.md) | Structure, trigger, routing and sufficiency evaluated separately | Offline structure/coverage gates; optional model routing evaluation |

Swamp's typed resources and schema-before-execution approach transfer well to
annotation plans. Its datastores, vaults, DAG execution, server, registry and
orchestration solve different problems and would burden Stet. Highest leverage
here is exact option/target validation plus framework-correct lifecycle examples.

## Implemented architecture

```text
intent → focused skill → source-target annotation plan → schema validation
       → installed canonical snippet → agent edits source → application checks
       → browser interaction/accessibility/optional screenshot → recover
```

Plans are versioned build-time JSON, never imported by browser attachers. They
record framework, intent, unique annotation IDs, ordered targets, primitive,
options, and mark kind. Targets contain a strategy, source file, locator and
human description. These are evidence for a source editor, not a selector engine.
Arrow target order is from then to. Prefer refs/directives/actions, existing IDs,
existing data/test attributes, semantic source elements, deliberately added
data-stet attributes, then justified structural CSS. Validation cannot establish
DOM uniqueness, correct intent, live visibility or accessible usability.

Derive option schemas from existing TypeScript interfaces and MarkKind. Keep
agent-only metadata in one small catalog; generate capabilities, plan schema,
plan declaration types and standalone validator. The capabilities schema pins the
exact generated snapshot for that installed version; it is not a cross-version
extension format. Read package identity from the
manifest. Check generated artifacts for drift. Runtime defaults that live in
rendering code are independently consistency-tested rather than moving renderer
constants into a Node-oriented catalog. No runtime modules import agent code.

Use a development-only JSON Schema compiler to ship standalone validation with
no installed dependency. Errors have stable codes, JSON paths, messages, and
nonzero exits. Structural schema checks are supplemented by unique-ID and
targeting/accessibility diagnostics. Plans deliberately require nonblank meaningful
text when supplied, a stricter authoring policy than the permissive runtime.

The CLI offers inspect, schema, validate, snippet, agent init/update, help/version.
JSON stdout stays parseable; normal errors go to stderr. Exit codes distinguish
invalid plans (1), usage (2), I/O (3), and install conflicts (4). Init does not
overwrite divergent files; update only replaces unchanged managed files. No
force flag or editing of CLAUDE.md/AGENTS.md is necessary. A journal records
old/new ownership for interrupted writes; locks serialize shared-path installs
and stale-owner reclamation. Uncertain ownership and human edits remain conflicts.

Canonical generation covers 30 primitive/framework snippets plus five lifecycle
patterns, including persistent controls, changing destinations, grouped cleanup,
CSS setup and meaning. It generates examples,
not application patches. Use-case skills teach explanation, review and showcase
judgment and route API questions to the base skill.

Alternatives: prose alone cannot reject hallucinated options; a runtime plan
interpreter would introduce targeting/lifecycle ownership; AST apply and MCP would
expand maintenance and coupling. None is needed for v1. A doctor cannot inspect a
browser from a local CLI; troubleshooting references suffice. Capabilities would
duplicate inspect. A generated settings-plan example provides an adaptable
starting point; no plan-init command is added. Bounded project inspection supplies
source/manifest evidence and installed-binary locations without selecting among
ambiguous apps or executing their scripts.

## Skill installation sources

Tool paths were checked against official [Claude](https://code.claude.com/docs/en/skills),
[Cursor](https://cursor.com/docs/skills), [OpenCode](https://opencode.ai/docs/skills/)
and [Codex](https://learn.chatgpt.com/docs/build-skills) documentation. Use
`.claude/skills` for Claude and shared `.agents/skills` for Cursor/OpenCode/Codex
to avoid duplicate copies when several tools share a project. No global setup,
network access, telemetry, model invocation or application execution in the CLI.

## Verification and release boundaries

Run existing tests/check/build/size/browser/demo checks plus CLI, schema fixtures,
skill format/reference/trigger-fixture checks, compiled framework snippets and
an actual packed consumer test. Record measured install-size growth separately
from unchanged browser size. Offline trigger fixtures prove coverage and expected
routes, not that a model will select a skill. Actual fresh routing/task trials are
required v1 release evidence; optional paid-model CI remains outside normal checks.
Release verification and remaining risks are recorded in agent-verification.md.
