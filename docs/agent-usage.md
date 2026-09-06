# Using Stet with coding agents

The npm package is **@funsaized/stet**; its local CLI binary is **stet**. Install
in the application package, then install project skills for your tool:

```sh
npm install @funsaized/stet
npx stet agent init --tool codex
```

The second command assumes the first succeeded and npm can resolve the local
binary. For automation, prefer `./node_modules/.bin/stet` (or the corresponding
hoisted installed binary); it cannot fetch a similarly named unscoped package.
The CLI needs Node.js 20 or newer. The browser runtime needs no CLI or plan.

Choose `claude`, `cursor`, `opencode` or `codex`. Claude uses `.claude/skills`;
Cursor, OpenCode and Codex share `.agents/skills`, so installing for all three
does not duplicate assets. Run from the project/package whose skills you want
installed. The installer does not edit general agent instructions or global
configuration. Check installed skill discovery in your agent's UI.

After upgrading the package:

```sh
./node_modules/.bin/stet agent update --tool codex --json
```

Init copies canonical skills and is idempotent for identical files. Update
replaces only files matching the prior managed hashes. Local edits, deleted
managed files and symlink destinations cause a conflict before any content is
written. Reconcile or move conflicting files and rerun; there is no force flag.
Files no longer shipped are retained. Individual writes are atomic; the entire
installation is not a filesystem transaction. An I/O failure may require a
retry after checking the named files. The `.stet-managed.json` manifest records
package version and hashes, without timestamps or machine-specific paths.

## Discover, plan, validate, implement, verify

```sh
./node_modules/.bin/stet inspect --json
./node_modules/.bin/stet schema annotation-plan
./node_modules/.bin/stet snippet sticky --framework react
./node_modules/.bin/stet snippet arrow --framework vue
./node_modules/.bin/stet validate annotation-plan.json --json
```

`inspect` reports installed package/version/exports, primitives, target counts,
accepted option schemas, required fields, defaults, effective styling options,
framework shapes and lifecycle/accessibility/targeting constraints. `schema`
always returns raw JSON Schema, suitable for editor integration. `snippet`
returns source text, or `{ok, primitive, framework, file, code}` with `--json`.
Every primitive has a minimal snippet for every framework. Readiness guards in
arrow samples demonstrate both targets must exist; preserve real controls when
adapting those examples. See the relevant skill reference for conditional use.

An annotation plan is a source-editing intermediate representation:

```json
{
  "version": 1,
  "framework": "react",
  "intent": "Explain the consequences of deleting saved settings",
  "annotations": [{
    "id": "delete-settings",
    "primitive": "sticky",
    "targets": [{
      "strategy": "ref",
      "file": "src/Settings.tsx",
      "locator": "deleteSettingsRef",
      "description": "Existing Delete settings button"
    }],
    "options": {
      "seed": 42,
      "text": "Deleting removes your saved settings."
    }
  }]
}
```

Verify that this consequence and source ref actually exist. Targets are ordered
`from`, `to` for arrows; all other primitives take one target. Mark has a required
plan-level `kind` (`right` or `wrong`), which maps to its separate core argument
or adapter prop/option. `intent` is free text, allowing judgment without a taxonomy
of tasks. IDs must be unique. Plan version is independent of package version.

Prefer existing refs/directive/action hosts, stable IDs, stable data/test
attributes, semantic source locations, deliberately added data-stet attributes,
then justified structural CSS. The CLI never resolves or evaluates locators.
CSS targets require rationale and produce warnings. Nonblank meaningful text is
an authoring requirement; the original runtime still accepts empty strings.

Validation emits `{ok, errors, warnings}`. Diagnostics contain `path`, `code` and
`message`, for example `annotations[0].options.side` / `INVALID_OPTION` for a
circle with a sticky-only option. Unknown fields are rejected. Optional meaning
produces a `DECORATIVE_ONLY` warning when absent; decide whether the mark needs a
description. Schema validation is structural; CLI validation additionally checks
unique IDs and CSS rationale. Neither proves source identity, CSS value validity,
copy accuracy, DOM readiness, accessibility or visual placement.

| Exit | Meaning | Recovery |
| --- | --- | --- |
| 0 | Success | Continue to application checks |
| 1 | Invalid plan | Fix reported paths and revalidate |
| 2 | Invalid command/flag/value | Read --help or inspect |
| 3 | I/O error or malformed JSON | Repair file/syntax/permissions |
| 4 | Skill installation conflict | Preserve and reconcile local files |

JSON mode writes exactly one JSON value to stdout, including failures, with no
progress messages. Human errors go to stderr. Output has no timestamps and is
stable for the same installed version, command and file state.

After validation, the agent edits existing application source using the snippet.
Run app type/build/tests and, when available, inspect the live UI: correct target,
keyboard/focus/click/form behavior, accessible descriptions, mobile overlap,
scroll tracking and cleanup on navigation. A plan passing validation is not a
completed UI implementation. Report any browser verification that could not run.

## Programmatic authoring and package assets

```ts
import type { AnnotationPlan } from '@funsaized/stet/agent';
import { validatePlan } from '@funsaized/stet/agent';

// Build-time only; pass JSON-shaped data from a file or editor.
const result = validatePlan(candidate);
```

The separate agent export never attaches annotations. Generated types describe
structural JSON; runtime validation also enforces nonblank text and unique IDs.
Schema and capabilities can be resolved through
`@funsaized/stet/agent/schemas/annotation-plan.schema.json` and
`@funsaized/stet/agent/capabilities.json`. JSON loading syntax depends on your
Node/bundler version; the CLI avoids that difference.

Skills shipped: `stet`, `stet-explain-ui`, `stet-review-ui`, `stet-showcase-ui`.
Use-case skills teach judgment and load the base operational workflow. Templates,
references and eval fixtures ship with the package. No source apply, browser
service, MCP server or agent orchestration is included.

## Maintaining the contract

Edit existing src TypeScript option interfaces for runtime API changes, and
`agent/catalog.mjs` for agent-only behavior metadata. Edit `agent/snippets.mjs`
for canonical examples. Run `npm run agent:generate`; do not edit generated
schemas, capabilities, plan types, validator or templates directly.

`npm run agent:check` detects drift. `npm run test:agent` checks schemas, CLI,
skill integrity and offline fixtures. `npm run test:templates` checks all five
frameworks. `npm run test:package` builds, packs, installs into a temporary
consumer and exercises shipped assets. Normal runtime tests compare advertised
numeric/motion/placement defaults with rendered output. Peer ranges remain in
package.json and are not expanded by agent tools.

See [architecture](agent-architecture.md), [backlog](agent-backlog.md),
[skill evals](agent-evals.md) and [verification results](agent-verification.md).

### Plan compatibility and diagnostics

Plan version 1 is an authoring contract, independent of the package version.
Validate with the installed package before editing source. An unsupported version
is reported at `version` with `INVALID_VALUE` and the supported version; inspect
that installation or use a compatible package. There is no automatic migration.
Additive tooling changes preserve valid v1 plans; incompatible authoring changes
require a deliberate new plan version. Capabilities describe the exact installation.

| Code | Correction |
| --- | --- |
| `REQUIRED` | Add the named field. |
| `UNKNOWN_PROPERTY` | Remove the field; inspect the installed schema. |
| `UNKNOWN_PRIMITIVE` | Choose one of the six listed primitives. |
| `INVALID_OPTION` | Correct the named primitive option's type/value or required field. |
| `TARGET_COUNT` | Supply one target, or two ordered from/to targets for arrow. |
| `INVALID_VALUE` | Follow the expected type, accepted values or nonblank/ID rule. |
| `DUPLICATE_ID` | Give each annotation its own ID. |
| `TARGET_RATIONALE_REQUIRED` | Explain why stable source targeting is unavailable. |

JSON Schema checks structure, option types, target arity and conditional CSS
rationale. The last requirement was already enforced by validatePlan; moving it
into schema does not reject previously valid plans. Unique IDs remain semantic.
`BRITTLE_TARGET` and `DECORATIVE_ONLY` are warnings requiring source/browser judgment.
TypeScript cannot express all these rules. None proves target identity or live UI
behavior. Error paths escape hostile property names; unrelated primitive union
branches are suppressed, but schema failure can never become a successful result.

### Interrupted skill installations

Init/update hold `.stet-lock` while preparing `.stet-journal.json`, staging content,
replacing files and committing the manifest. Retry the same command after an
interruption: success includes `recovered: true` when a journal was completed.
The journal records expected old hashes and new content, including the manifest;
recovery checks the complete write set before proceeding. Obsolete files and
unowned old `.stet-tmp` files are retained. Only token-owned staging files are used.

`INSTALL_LOCKED` means another local process is alive (possibly a reused PID), or
ownership cannot be proven. Wait for the active installer. A dead local owner's
unchanged host/PID/random-token record can be reclaimed automatically. Unknown
hosts, incomplete lock records and malformed journals require preserving the
records and confirming the operation has stopped before reconciling them.
`INVALID_RECOVERY` identifies malformed journals; `RECOVERY_CONFLICT` names content
edited since preparation. Compare the named file with the journal's intended
content, preserve the human edit, and reconcile before retrying. There is no force
option. Hash rechecks protect cooperative updates and detect observed editor
changes; this is not an OS lock on arbitrary editors or a power-loss durability
guarantee. A torn preparation record is reported as a conflict, never success.

### Lifecycle patterns

`stet snippet --pattern lifecycle --framework react` (also vanilla, Vue, Svelte,
Angular) emits a complete local lifecycle pattern. Enable/disable affects marks
only. Multiple handles share cleanup; missing arrow destinations suppress only
the arrow; replacements reattach with fixed seeds; teardown destroys all handles.
The Vue/Svelte single-arrow snippets use the same safe approach. Adapt the sample
control and destination state to existing application source, preserving native
handlers and form behavior. Patterns use core handles where adapters cannot
represent missing targets safely. `npm run test:patterns` executes generated code
in real frameworks; compiler success alone does not establish live correctness.

### Read-only project evidence

`stet inspect --project . --json` preserves `capabilities` and adds `project`:
framework `candidates`, `ambiguous`, sorted source/manifest `evidence`, per-package
`declaredStet`, resolvable `installed` version/package/binary, and declared `checks`.
Checks are data, never executed. Multiple apps or frameworks remain ambiguous;
select the intended app using source evidence. A declared range is not proof of
installation. Empty candidates mean unknown, not an implicit framework choice.

The bounded scan ignores hidden folders, dependency/build/vendor trees and
symlinks, reads at most 240 source/manifest files of 256 KiB each, visits at most
120 directories to depth four, and checks at most 32 ancestor installation paths.
`truncated` and `errors` make incomplete evidence explicit. It is npm-compatible
filesystem discovery; PnP and custom loaders need their own installed-tool lookup.
Narrow a large monorepo with `--project path/to/app`. Source imports/extensions
are clues, not proof of framework configuration. No install, scripts or writes run.
The generated `agent/examples/settings.plan.json` illustrates ordered arrow and
mark targets. Replace its fictional source paths/IDs and verify consequence copy.
