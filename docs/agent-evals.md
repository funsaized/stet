# Skill evaluation

`npm run test:agent` checks skill frontmatter, names, relative references,
canonical template presence, and trigger-fixture coverage. Each skill has positive
and negative prompts. `agent/evals/routing.json` is the canonical source and generates per-skill trigger fixtures via
`npm run agent:generate`. It defines a single **entry** route;
use-case skills subsequently load the base implementation workflow. This avoids
mistaking purposeful progressive loading for accidental multiple activation.

These offline checks do not simulate a model or establish trigger accuracy.
Swamp's promptfoo/Tessl pipeline separates format, triggering, internal routing
and guide sufficiency. That separation is useful; mandatory paid provider CI is
not justified for this small initial catalog.

For a model routing trial, supply only the four SKILL.md names/descriptions and
a fixture query, and ask the chosen model to return one skill name or `none`.
Do not provide expected answers. Record exact provider/model version, prompt,
settings, date and raw responses. Assemble a file:

```json
{
  "model": "provider/exact-model-version",
  "predictions": [{"query": "Fix the database migration", "selected": "none"}]
}
```

Include every query exactly once, then score without network access:

```sh
node scripts/agent/eval-routing.mjs predictions.json
```

The scorer reports per-query outcomes and exits 1 for mismatches, 2 for malformed
input. A perfect routing score still does not prove implementation quality.
For sufficiency trials, use an isolated application, give the vague settings-screen
request, and assess valid plans, truthful copy, actual DOM targeting, framework
build, interaction/cleanup and visual verification. Include recovery from a
missing arrow destination and a rejected option. Preserve raw artifacts and
compare with an unassisted baseline before claiming an improvement.

Promptfoo can drive the same fixtures and Tessl can review the skills, but neither
is installed or invoked by normal CI. No remote-model evaluation was performed
for the initial implementation. The scorer's own test uses synthetic responses
only. The updated [execution backlog](agent-backlog.md) requires actual model
routing and application-task evidence for polished v1 completion, while keeping
paid-model CI optional.

## Prepared v1 task trials

`node scripts/agent/prepare-trials.mjs /tmp/stet-v1-trials` prepares nine isolated
apps from five small source fixtures and an actual tarball. Choose a new empty
output directory on repeat. It installs local skills for eight tasks and leaves
the ordinary-docs React baseline without installed skills. Development compilers
are linked from the existing checkout; this is an isolated source context, not a
security boundary. It neither calls a model nor starts an orchestration service.

The output manifest identifies five settings tasks, React review/showcase/recovery,
and the equivalent React ordinary-docs baseline. Prompts are outside app folders;
expected routes and browser scoring remain outside the supplied context. The
routing prompt includes only skill descriptions and the 21 queries. Never copy
expected labels into predictions and call that a model trial.

Run each task in a fresh authorized coding-agent session rooted at its app,
supplying its prompt and retaining model/version/settings, session identity, raw
response/events, errors, source diff, plan and check output. Existing ChatGPT login
was detected locally with Codex CLI 0.153.2; no additional agent or paid model run
has been started by the preparation script. Session delegation authorization is
pending. Do not treat elapsed time as permission or switch to paid API usage.

Run the supplied app's `npm run check`, then
`STET_TRIAL_ROOT=/tmp/stet-v1-trials npx playwright test -c playwright.trials.config.ts`.
Browser checks cover plans/source evidence, annotations, unchanged native warning
and confirm/dismiss behavior, focus, submit, persistent control identity,
destination replacement, disable/unmount and screenshots. Inspect screenshots and
source diffs separately for truthfulness, correct targets and visual quality.
Compiler/browser assertions alone cannot replace that review. Ordinary CI stays
model-free; trial checks require deliberately prepared, completed task apps.

### Nonblind development finding

The primary implementer ran the React settings task on 2026-09-06. The
[raw source/plan and result record](evidence/v1-05/nonblind-react/result.json)
retain both attempts. [The first screenshot](evidence/v1-05/nonblind-react/failed/result.png)
failed visual review despite passing compiler/interaction checks: redundant notes
obscured the native warning. [The corrected screenshot](evidence/v1-05/nonblind-react/passed/result.png)
uses one focal circle and preserves the warning. The explanation skill now calls
out this specific recovery. This is **nonblind development evidence**, not actual
unfamiliar-agent routing, not a baseline comparison, and not a release-evaluation
pass. All 21 fresh routing responses and the nine fresh task sessions remain
unrun pending explicit delegation authorization.

The bundled example was sufficient for this development task, so v1 does not add
`plan init`. Fresh trials still need to confirm the workflow; no speculative
source-apply engine or Stet-owned MCP server is introduced. Existing source edits
and Playwright completed this development task, including finding and fixing a
visual error that schema/compiler checks could not detect.
