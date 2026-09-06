# Agent-first v1 release handoff

Proposed version: **0.1.0**, reflecting the additive authoring-tool release while
keeping the existing pre-1.0 human API. This is a proposal, not a publication or
version bump on `agent-first`. Do not publish another artifact as 0.0.2.

V1-05 now has actual-model evidence: 21/21 routing before and after corrections,
nine initial fresh-context task sessions, two fresh reruns and a separately
recorded guided baseline plan recovery. All final sources compile and the 27
plan/layout/browser checks pass, including model-free artifact replay. Source
and screenshot reviews are retained in agent-evals.md. The arrow label failure
is fixed; its thin path still crosses intervening warning text, which remains
readable in the inspected result. Stet does not provide obstacle-avoiding routing.

The proposed archive has been refreshed with the final evidence summary and
guidance. Version, merge and publication remain separate maintainer decisions;
no new paid API integration or publication has occurred.

The fresh-consumer workflow is documented in agent-usage.md and executed by the
packed-consumer and isolated task checks: install the scoped archive, install
skills, inspect project/capabilities, adapt a source-evidenced plan, validate it,
read a primitive/pattern, edit existing source, run app checks and inspect the
browser. The retained failed/corrected screenshots demonstrate why the last step
cannot be replaced by JSON or compiler checks.

After the final archive is verified and the version/release are approved:

1. Update package.json and package-lock.json to the agreed version without an
   automatic git tag, then regenerate canonical artifacts through `npm run build`.
2. Run `npm run check`, `npm test`, `npm run test:templates`, `npm run test:package`,
   `npm run size`, `npm run test:patterns`, `npm run test:browser` and
   `npm run test:demos`. Require green branch CI, including Ubuntu WebKit and
   Linux/Windows Node consumers. Inspect the actual proposed tarball identity.
3. Commit the release metadata, obtain/use the authorized merge and publication
   decision, and publish the verified new npm artifact. Neither a green CI run
   nor this document authorizes publication.
4. Verify the registry metadata and installed published package, create the
   corresponding release/tag only when authorized, and use the existing
   `.github/workflows/release.yml` mirror process. It calls
   `scripts/prepare-github-release.mjs` to download and integrity-check the already
   published npm archive, then `scripts/publish-github-package.mjs` to mirror it.
   It does not rebuild and republish an existing npm version.

Human-developer review: the core, adapters and stylesheet retain their API and
ownership boundary. Agent tooling is optional. Application controls retain
layout, semantics, accessibility, focus, pointer/form behavior and lifecycle.

Coding-agent review: installed facts, precise diagnostics, bounded discovery,
source-evidenced plans and tested lifecycle examples are available. Target
identity and visual quality still require source and browser review. Actual-model
results now cover all required scenarios, with first-attempt failures and guided
recovery distinguished from fresh reruns. Small-sample results are not a general
agent-performance guarantee.

Maintainer review: edit canonical factories and TypeScript, regenerate artifacts,
and run drift checks before regeneration in CI. Tests and dev-only framework
packages do not enter browser imports. Runtime dependencies and size limits remain
unchanged. The deliberately bounded eval fixtures are development tools, not an
AST rewriting engine, MCP server or orchestration system.

## Review artifact

An isolated copy was built with proposed version 0.1.0; the branch package.json
remains 0.0.2. `npm run build` and `npm run test:package` passed from that copy,
including matching installed CLI/capabilities/types. The initial review artifact is retained at
`.release-artifacts/proposed/initial-funsaized-stet-0.1.0.tgz` (646,338 B compressed,
1,143,788 B unpacked, 169 files). SHA-256:
`886ae66c3d9b5c9518084d3c137a50be2ac5843cb91be60600ebe274b68bbb35`.
It includes the code through c712c62 plus the draft documentation handoff, before
final evidence reconciliation. It is for review, not an approved publish artifact;
regenerate after the final evidence/version decision. Browser bundles remain
3,387 / 4,957 B gzip and require zero dependencies.

After explicit release approval, the existing npm/tag workflow can use:

```sh
npm version 0.1.0 --no-git-tag-version --ignore-scripts
npm run build
# Run every documented local/CI/evaluation gate and commit approved release metadata.
npm pack --ignore-scripts
# Publication and tag/release creation require the separate approval:
npm publish funsaized-stet-0.1.0.tgz --access public
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 --title 'Stet 0.1.0' --notes-file docs/release-notes-0.1.0.md
```

The draft notes are prepared in docs/release-notes-0.1.0.md; reconcile their
evidence summary against the retained trial results and release decision. Verify the npm
installed artifact before creating the release; release publication triggers the
existing GitHub Packages mirror. These commands have **not** been executed.

## Implementation commits

| Item | Commits |
| --- | --- |
| V1-01 | `9522651`, `b9e628a` |
| V1-02 | `f8b1e91`, `bdb1798` |
| V1-03 | `f2867bb` |
| V1-04 | `01bfc37`, `ecc816e` |
| V1-05 preparation/nonblind evidence | `b72d7a7` |
| V1-05 actual trials, corrections and replay | `2d82339` |
| V1-08 initial handoff | `6813934`, `760d307`; refreshed handoff follows `2d82339` |
| V1-06 | `340d9b4`, `05fcd86`, `c712c62`, `5fb605d`, `ccb0595` |
| V1-07 | `0a256e1` |

The final documentation reconciliation follows these commits. Every listed change
was pushed to origin/agent-first; none was merged or published. Supported-host CI
run 34053224385 for `2d82339` is fully green (95 unit/agent, 35 compiled assets,
42 browser, 27 lifecycle/SSR, four native consumer jobs). The evaluated proposed
archive also passes its installed CLI consumer checks.

The final refreshed review archive is `.release-artifacts/proposed/funsaized-stet-0.1.0.tgz`.
Its exact file list, sizes and integrity are in `pack.json` alongside it; SHA-256
is in `SHA256SUMS`. It includes the final CLI fix, actual-model evidence summary,
review/arrow skill corrections and reconciled documentation. Raw model evidence
stays in the checkout under `tests/` and is not included in the npm package.
The archive was built in an isolated copy with matching 0.1.0 capabilities, CLI
and types, and checked through the real packed-consumer gate. The branch remains
0.0.2. The prior pre-trial archive is retained alongside it as
`pre-trials-funsaized-stet-0.1.0.tgz`. No package has been published.


## Ready for the release decision

V1-01–07 and the V1-08 engineering handoff are verified. The chosen release
proposal is 0.1.0; approve the version, merge and publication when ready to execute
the commands above. The actual-model results retain two failed first attempts,
their fresh reruns and a separately guided baseline recovery. The remaining
placement limitation is explicit: arrows do not route around intervening text.
No required failed check is silently waived, and no release exception is assumed.
The final branch CI result is retained with the local review artifact as `ci.json`
and linked in the delivery report, without repacking merely to embed that result.
