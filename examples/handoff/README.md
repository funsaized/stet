# Reproducible source and injected handoff

This example explains the account-security form at `/examples/handoff/` after
both application modules report ready. It uses `@funsaized/stet@0.2.0` installed
from the tarball packed by the test setup, rather than a checkout-only import.

Run it from the repository root:

```sh
npx playwright test -c playwright.handoff.config.ts
./test-results/pw08/consumer/node_modules/.bin/stet validate examples/handoff/annotation-plan.json --json
```

The Playwright setup builds and packs Stet, installs that tarball into an offline
consumer, serves this route, and writes:

- `test-results/handoff/source.png`: the durable source-authored circle from
  `source.js`; `annotation-plan.json` records its reviewed intent and target.
- `test-results/handoff/injected.png`: the same state plus a temporary underline
  added through `@funsaized/stet/playwright` and removed by `session.dispose()`.

Use source authoring when the explanation belongs in the application or a reusable
preview. Use Playwright injection when the explanation is temporary and the
deliverable is an artifact. If intended lifetime is unclear, ask: **Should this
explanation remain in the application, or exist only in this captured handoff?**

The checks separately verify control identity, unchanged layout, focus, typing,
submission, accessible descriptions, pointer transparency, and cleanup. A
deliberately broken submit proves that visible annotations do not turn a failing
application check into a pass.

Stet does not run an agent, edit source automatically, or perform QA. The coding
agent or developer authors the explanation; Playwright and application tests check
behavior.

Remaining uncertainty: deterministic image bytes are established only for the
pinned local Chromium setup. WebKit, cross-origin frames, cross-document arrows,
navigation reuse, restrictive CSP, and other environments are not claimed by this
example.
