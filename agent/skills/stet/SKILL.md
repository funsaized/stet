---
name: stet
description: Install, add, modify, validate or debug Stet UI annotations, choose source versus temporary Playwright injection, and choose its framework integration. Use for Stet primitives, options, plans and lifecycle questions. For a whole UI explanation, visual review or product showcase, start with the corresponding stet-explain-ui, stet-review-ui or stet-showcase-ui skill and load this skill for implementation. Excludes ordinary tooltips, tours, component design and unrelated application work.
---

# Stet

Stet annotates existing UI. Keep the real elements, handlers, layout, semantics,
focus and form behavior. Annotation text supplements the interface; it does not
replace essential labels, validation or dangerous-action confirmations.
Stet does not run an agent, edit source automatically, or decide whether the UI
is correct.

Before implementation, choose delivery by intended lifetime. Durable or published
UI belongs in application source. A temporary screenshot/test artifact may use
caller-owned Playwright injection without editing the app. Temporary annotations
that must run in the application still use a source review boundary. If lifetime,
artifact, or execution context is missing, ask which is intended rather than
guessing. Read [delivery choice](references/delivery.md) for limits.

## Action → Verify → Recover

1. Inspect the relevant application package and source to identify its framework,
   existing Stet version, CSS setup and checks. In a monorepo, work in that package.
   If absent, install `@funsaized/stet` using the project's package manager.
2. Query the **installed** tool: `./node_modules/.bin/stet inspect --json` and
   `./node_modules/.bin/stet --help`. If dependencies are hoisted, locate that
   installed binary and run `stet inspect --project . --json` for bounded source,
   manifest, check-command and hoisting evidence. Ambiguity requires source
   investigation, not a guessed framework. Never run bare `npx stet` without a local installation: the
   unscoped package name is not the Stet npm package. Do not invent APIs from memory.
3. Clarify intent from the UI/source. Read only the relevant references below.
   Locate actual elements and preserve their lifecycle; don't wrap controls to
   create targets. Determine why each mark helps and whether it carries meaning.
4. Follow only the selected delivery branch:
   - **Playwright injection:** do not write a plan, adapt a framework snippet, or
     edit application source. Use the caller's `Page` or same-origin `Frame` and
     `Locator` with `@funsaized/stet/playwright` as described in
     [delivery choice](references/delivery.md), then dispose in `finally`.
   - **Application source:** read `stet schema annotation-plan`, write a plan with
     source-target evidence, and run `stet validate <file> --json`. Then read
     `stet snippet <primitive> --framework <framework>` and adapt it to existing
     controls in source. Do not execute plan locators or treat a plan as a runtime
     API. Plan validity does not prove targets exist or are unique.
5. Run the application's type/build/tests. Where a browser is available, check
   target identity, readable text, keyboard/focus/click/form behavior, narrow
   layouts, scrolling and cleanup after navigation/conditional removal. Use fixed
   seeds and reduced motion for screenshots. Inspect the actual result.
6. On failure, read [troubleshooting](references/troubleshooting.md), fix the
   diagnosed cause, rerun the failed check, and revalidate only for the application
   source branch. Report checks actually performed and any missing browser
   verification; never equate valid JSON with a verified implementation.

In commands below, `stet` means the located installed binary. After upgrading
Stet, run `stet agent update --tool <tool>` to refresh unchanged managed skills.
Local edits cause a conflict; reconcile them instead of deleting project config.

## Focused references

| Need | Read |
| --- | --- |
| Primitive choice and factual API lookup | [primitives](references/primitives.md) |
| Source targets and plan example | [targeting](references/targeting.md) |
| Meaningful text, dangerous actions, motion | [accessibility](references/accessibility.md) |
| DOM lifecycle / multiple / conditional marks | [vanilla](references/vanilla.md) |
| React refs | [react](references/react.md) |
| Vue directives | [vue](references/vue.md) |
| Svelte actions | [svelte](references/svelte.md) |
| Angular directives | [angular](references/angular.md) |
| Explanation of completed implementation | [handoff](references/handoff.md) |
| Production, preview or local-only shipping | [shipping](references/shipping.md) |
| Durable source versus temporary Playwright injection | [delivery choice](references/delivery.md) |
| Errors and verification failures | [troubleshooting](references/troubleshooting.md) |
