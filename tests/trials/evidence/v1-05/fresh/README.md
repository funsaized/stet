# Actual v1 evaluation evidence — 2026-09-06

These are real model responses and task edits, not synthetic scorer inputs.
[results.json](results.json) records outcomes and final source hashes;
[metadata.json](metadata.json) records model/settings, package hashes and scope.
Each task folder retains its exact prompt, final response, compressed raw CLI
JSONL events, stderr, application files, source diff and session identity.
Read raw events with `gzip -dc <task>/events.jsonl.gz`.
[Environment follow-up](environment.md) separates the reported Chromium startup
abort from application check failures.

Model: `gpt-6-astra`, reasoning effort `medium`, Codex CLI 0.153.2, existing
ChatGPT login. No immutable backend snapshot identifier was exposed. These are
fresh-context sessions with no inherited implementation conversation; they are
not rigorously blind trials, since the installed package includes its ordinary
examples and prior development documentation. App sources are isolated, not a
security boundary. No new paid API integration or model-dependent CI was added.

| Task | First fresh attempt | Final retained result |
| --- | --- | --- |
| [Vanilla settings](settings-vanilla/) | Pass | Same source; compiler/plan/layout/browser and visual review pass |
| [React settings](settings-react/) | Pass | Same source; all checks and visual review pass |
| [Vue settings](settings-vue/) | Pass | Same source; all checks and visual review pass |
| [Svelte settings](settings-svelte/) | Pass | Same source; all checks and visual review pass |
| [Angular settings](settings-angular/) | Pass | Same source; all checks and visual review pass |
| [React review](review-react/) | Failed: changed the examples' layout to fit notes | [Fresh rerun](review-react-rerun/) uses compact verdict marks; original layout preserved |
| [React showcase](showcase-react/) | Pass | Highlights/underlines existing feature copy; decorative-only plan warnings reviewed |
| [React recovery](recovery-react/) | Failed visual review: floating label obscured native warning; agent reported browser access failure | [Fresh rerun](recovery-react-rerun/) removes redundant floating label, uses accessible description; browser verified |
| [React ordinary-docs baseline](baseline-react/) | UI and prose plan pass; machine-readable plan absent | [Guided public-type recovery](baseline-react-recovery/) adds valid JSON; source and original prose unchanged |

[Initial routing](routing/score.json) and [post-fix routing](routing-rerun/score.json)
each score 21/21. Only skill descriptions and queries were supplied, with tools
forbidden and expected labels withheld. This measures explicit entry selection,
not an editor's automatic discovery mechanism.

The React skill task used one circle and produced a validated JSON plan without
follow-up. The ordinary-docs baseline used a circle, highlight and arrow, and
produced a source-evidenced prose plan. Both preserved UI behavior. Its later
JSON-only recovery received an explicit format requirement and is not part of
the original matched comparison. This single pair supports no general speed,
cost or success-rate claim.

The first review changed the good input from 197px to 316px wide and moved it.
[The original-layout check](initial-matrix/checks.log) reproduces that failure.
The review skill now directs agents to simplify notes instead of relaying out
examples. The arrow-selection reference now explains that endpoint clearance
does not protect intervening text. Neither correction changes runtime code.

[Final matrix](final-matrix/checks.log): 27/27 pass, comprising nine schema/source
checks, nine comparisons against pristine desktop/mobile application layouts,
and nine browser interaction/lifecycle cases. Per-app independent compiler logs
and screenshots are in that directory. The primary implementer inspected the
source diffs and screenshots separately. The final arrow's thin path still
crosses the native warning; the text remains readable in the inspected capture.
This is not collision-free arrow routing, all-browser task evaluation or a screen
reader certification. The library's separate multi-engine gates remain necessary.

Earlier logs retain harness failures too: prompts did not prescribe a plan
filename, so the manifest now identifies the agent's actual JSON file. Plan and
browser checks run separately, so a missing plan does not suppress live checks.
Immediate full-page screenshots after resizing captured stale overlay bounds;
the harness now waits for frame-batched geometry and asserts native page width.
The `initial-matrix` uses original task implementations with the baseline's guided
JSON plan already added; `initial-checks` preserves the original baseline failure.

## Replay the final implementations without a model

From the repository with its existing development dependencies installed, choose
a new output directory:

```sh
node scripts/agent/replay-trials.mjs /tmp/stet-evidence-replay-new
STET_TRIAL_ROOT=/tmp/stet-evidence-replay-new ./node_modules/.bin/playwright test -c playwright.trials.config.ts
node scripts/agent/eval-routing.mjs tests/trials/evidence/v1-05/fresh/routing-rerun/predictions.json
```

The [verified replay](replay/browser.log) passes the same 27 checks.
The replay installs a current local tarball, builds pristine reference apps,
restores the retained final source/plan files and compiles each app. It does not
invoke a model and must not be described as another agent trial. Reproduction of
a historical model response is not guaranteed. The original trial tarball and
skill hashes are recorded separately from the current replay archive.

Evidence stays under `tests/` and is excluded from the installed npm package.
