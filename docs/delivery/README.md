# Stet delivery plan

This directory turns [the product direction](../product-direction.md) into work
that can be assigned to bounded implementation agents.

## Authority

1. `contracts/` contains approved behavior. Workers must not reinterpret it.
2. `backlog.md` records dependencies, release scope, and status.
3. `tasks/` contains one executable assignment per task.
4. `evidence/` defines how checks and artifacts are recorded.

The product-direction document explains why; this directory defines how. If they
conflict, stop and resolve the contract before changing code.

## Workflow

Tasks move through:

```text
BLOCKED -> READY -> IN_PROGRESS -> REVIEW -> ACCEPTED
```

Only the integrator marks a task `ACCEPTED`. A worker may return `REVIEW` or
`BLOCKED`. A task is `READY` only when its prerequisites are accepted, its scope
matches the current revision, and no relevant contract question remains.

## Worker rules

- Read the task, contracts, listed code, and callers before editing.
- Edit only the allowed scope. Stop if correctness requires another file.
- Do not add dependencies, public APIs, or abstractions unless specified.
- Do not hand-edit generated files or weaken tests to obtain a pass.
- Do not update snapshots or size limits without explicit acceptance criteria.
- Include the smallest regression check with nontrivial behavior.
- After two failed fixes for the same failure, stop with evidence.
- Never commit, push, publish, or contact users unless explicitly authorized.

## Verification commands

Tasks select the narrowest relevant subset from `package.json`:

```bash
npm test
npm run check
npm run test:agent
npm run test:templates
npm run test:package
npm run test:browser
npm run test:patterns
npm run test:cli-consumer
npm run size
npm --prefix website run check
npm --prefix website test
```

`npm run build` generates agent artifacts. Generated changes must be declared and
reviewed. Missing browsers or tools mean unverified, not passed.

## Dispatch

Shared runtime files (`src/mount.ts`, `src/primitives.ts`, `src/rough.ts`,
`style.css`), package metadata, and generator/catalog files have one writer at a time. Framework adapter
tasks may run in parallel only after the shared runtime is accepted. The first
dispatch batch is `BASE-01`; contract tasks follow its evidence.
