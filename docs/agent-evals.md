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

For an optional model trial, supply only the four SKILL.md names/descriptions and
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
for this implementation. The scorer's own test uses synthetic responses only.
