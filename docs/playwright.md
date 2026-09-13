# Playwright integration

`@funsaized/stet/playwright` creates temporary Stet annotations from caller-owned
Playwright `Page`, same-origin `Frame`, and `Locator` objects. The optional entry
supports Playwright `>=1.63 <2`; Playwright is not installed or imported at runtime
by Stet.

```ts
import { createStet } from "@funsaized/stet/playwright";

const stet = await createStet(page);
const note = await stet.circle(page.getByRole("button", { name: "Save" }));
await note.show();
await stet.dispose();
```

The package contains its browser payload and stylesheet. Stet serves those bytes
through same-origin Playwright routes and loads URL-backed script and style tags,
so the page's Content Security Policy remains active. It does not use a CDN,
inline the payload, call `bypassCSP`, or require a consumer bundler. A policy must
permit same-origin `script-src` and `style-src`; otherwise `createStet` rejects
with `CSP_BLOCKED` and an actionable message. Other asset failures use
`LOAD_FAILED`.

## Supported matrix

| Context | Chromium | Firefox |
| --- | --- | --- |
| Current Page document | Supported | Supported |
| Same-origin Frame, including inherited-origin `about:blank` | Supported | Supported |
| Cross-origin or opaque sandboxed Frame | Unsupported | Unsupported |
| Locator from another document or cross-document arrow | Rejected | Rejected |

WebKit is not a first-release support gate and is not claimed. Workers,
browser contexts, element handles, locators passed as the context, detached
frames, and cross-origin frames are unsupported.

Each locator is resolved once and must match exactly one connected element in the
bound document. Navigation or frame detachment permanently invalidates the
session. Stet does not rediscover targets, cross documents, or reinject after
navigation; create a new session explicitly. `dispose()` removes only that
session's annotations and resources, leaving source-authored Stet and other
sessions untouched.

## Deterministic screenshots

Use an explicit viewport and application state, fixed annotation seeds, a pinned
font, and `reducedMotion: "reduce"`. Wait for `document.fonts.ready`, await each
remote `show()` result, call `refresh()` after fonts/layout settle, and assert
`document.getAnimations().length === 0` before capture. This avoids arbitrary
animation sleeps. Keep visible text in the capture explaining what is marked and
why; an image alone is not a review handoff. The runnable recipe is
`examples/playwright/`, verified in pinned Chromium by `playwright.pw07.config.ts`.

## Verify behavior separately

Annotations are not evidence that the underlying application works. Assert DOM
identity, layout, focus, typing, submission, accessible descriptions, pointer
behavior, and cleanup independently. Keep `dispose()` in `finally` so a failed
application assertion cannot leave injected resources behind. The packed-consumer
example and deliberate broken-submit check run under `playwright.pw08.config.ts`.
