# Agent-first v1 release handoff

Proposed version: **0.1.0**, reflecting the additive authoring-tool release while
keeping the existing pre-1.0 human API. This is a proposal, not a publication or
version bump on `agent-first`. Do not publish another artifact as 0.0.2.

The release remains blocked on V1-05 fresh routing/task evidence (21 routing
queries and nine task sessions, including the React ordinary-docs baseline).
The apps, prompts and acceptance checks are prepared. Additional-agent delegation
requires the pending explicit authorization; no new paid model usage is authorized.
A nonblind development success is not a substitute. Merge/publication approval
has not been given. No release exception has been accepted.

The fresh-consumer workflow is documented in agent-usage.md and executed by the
packed-consumer and isolated task checks: install the scoped archive, install
skills, inspect project/capabilities, adapt a source-evidenced plan, validate it,
read a primitive/pattern, edit existing source, run app checks and inspect the
browser. The retained failed/corrected screenshots demonstrate why the last step
cannot be replaced by JSON or compiler checks.

After the evidence blocker is resolved and the version/release are approved:

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
identity and visual quality still require source and browser review. Fresh-agent
behavioral claims remain blocked until the real trials run.

Maintainer review: edit canonical factories and TypeScript, regenerate artifacts,
and run drift checks before regeneration in CI. Tests and dev-only framework
packages do not enter browser imports. Runtime dependencies and size limits remain
unchanged. The deliberately bounded eval fixtures are development tools, not an
AST rewriting engine, MCP server or orchestration system.

## Review artifact

An isolated copy was built with proposed version 0.1.0; the branch package.json
remains 0.0.2. `npm run build` and `npm run test:package` passed from that copy,
including matching installed CLI/capabilities/types. The local review artifact is
`.release-artifacts/proposed/funsaized-stet-0.1.0.tgz` (646,338 B compressed,
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
explicit pending-evidence statement after the trial results and release decision. Verify the npm
installed artifact before creating the release; release publication triggers the
existing GitHub Packages mirror. These commands have **not** been executed.

## Implementation commits

| Item | Commits |
| --- | --- |
| V1-01 | `9522651`, `b9e628a` |
| V1-02 | `f8b1e91`, `bdb1798` |
| V1-03 | `f2867bb` |
| V1-04 | `01bfc37`, `ecc816e` |
| V1-05 preparation/nonblind evidence | `b72d7a7` (fresh trials remain blocked) |
| V1-06 | `340d9b4`, `05fcd86`, `c712c62`, `5fb605d`, `ccb0595` |
| V1-07 | `0a256e1` |

The final documentation reconciliation follows these commits. Every listed change
was pushed to origin/agent-first; none was merged or published. Supported-host CI
run 34042217795 is fully green (42 browser, 27 lifecycle/SSR, four native consumer
jobs). The latest CLI fix has separate passing subprocess and tarball checks.
