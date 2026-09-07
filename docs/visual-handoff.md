# From working code to visual handoff

Stet is a small annotation library. It adds hand-drawn emphasis and explanatory
text to live elements while the application keeps focus, clicks and layout.
Unlike a tour controller, it does not own navigation, progress or modal behavior.
Unlike a collaboration product, it does not store comments, requirements or users.

The [live use cases](https://stetkit.com/use-cases) put the annotation layer on
workspace settings, account security and a release form. The
[agent walkthrough](https://stetkit.com/agent-workflow) shows the actual shipped
contract in a deterministic sequence. It neither calls a model nor edits code
in the browser. See the [local setup](../website/README.md) to explore this
checkout before deployment.

## Reproduce a scenario

From the repository root:

```sh
npm ci
npm --prefix website ci
npm --prefix website run dev
```

Open `/use-cases/security-handoff`, try the controls, then expand “Inspect plan,
source & verification”. Source shows the actual React component being rendered;
Shared options shows its `options.ts` configuration. Copy both files, preserve their
relative imports, and adapt the component and CSS to your project. These two
source files have no agent-tooling dependency. The runtime imports
only Stet primitives/adapters. The fixture source includes a local-demo label and
explicit local behavior; replace those handlers only when implementing your app.

The Frameworks panel shows canonical examples for the first primitive in the
plan, not an automatic translation of the whole fixture. Run
`stet snippet --pattern lifecycle --framework <name>` for multiple/conditional
marks. All five integrations use the same primitive options and lifecycle model.

Copy Plan into `annotation-plan.json`, then run the installed binary:

```sh
./node_modules/.bin/stet inspect --project . --json
./node_modules/.bin/stet validate annotation-plan.json --json
./node_modules/.bin/stet snippet circle --framework react
```

Adapt the plan's file/ref evidence to your actual source. Validate again, build
your app, exercise native interactions with marks on/off, and inspect desktop
and narrow layouts. JSON validation cannot prove the targets or copy are correct.

## A useful agent request

> Use stet-explain-ui to explain the account-security changes you implemented.
> Annotate the meaningful changed controls, report what you actually verified,
> and distinguish follow-up work. Keep the UI usable and preserve its layout.

The order is implementation → application verification → concise annotations →
human review of the working UI. The showcase is a prebuilt demonstration of this
order; it does not claim a model runs or performs edits as you advance stages.
Use review for suspected defects and showcase for a product presentation.

A handoff might say:

- Implemented: minimum password length, revoke control, setup entry point.
- Checked: the exact browser interactions and build command that actually ran.
- Follow-up: authentication provider integration, server persistence, real 2FA.

The local security fixture deliberately stops before those server features. Its
ink describes that boundary instead of claiming account security is production-ready.

## Shared vocabulary across delivery

| Workflow | Useful perspectives | Input | What the ink connects |
| --- | --- | --- | --- |
| Explain | Developer, Product, documentation | Requirement / question | Consequence to existing warning and action |
| Review | UX, QE, Engineering | Observed defect / design intent | Finding to the actual failing element/state |
| Showcase | Agent, Developer, Product | Demo brief | Feature value to working controls |
| Handoff (explanation) | Agent, Engineering, reviewer | Implemented diff + evidence | Meaningful changes to live UI |
| Verify (review) | QE, developer | Test/browser observations | Acceptance evidence to its relevant control |

The viewpoint examples use distinct interfaces: workspace deletion for explanation,
billing totals for Product, empty-search recovery for UX, account security for
Engineering, and CSV import checks for QE. The form-review example compares a
reproducible focus defect with a working fix annotated in green. Developer examples
use a deployment form and an activity inbox. Stet visualizes findings; the
application and its tests own behavior and verification.

Roles and statuses live in demo metadata. No semantic project-management fields
are added to `circle()` or the plan schema. No role-specific skills are needed.
The four existing skill names and routing descriptions remain unchanged. A small
handoff reference adds delivery-specific judgment to explanation; new model
routing/application trials would be needed before claiming measured improvement.
