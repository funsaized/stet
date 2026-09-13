# Rough Notation compatibility for the first release

This reference describes Stet's first-direction-release candidate, not the
registry's older `@funsaized/stet@0.1.0` artifact. RELEASE-02 binds public proof
to the accepted candidate artifact before release. Stet is not a drop-in Rough
Notation replacement: names, defaults, handles, framework adapters, and lifecycle
semantics differ.

## First-release surface

Stet exposes named `circle`, `underline`, `highlight`, and `box` functions for the
four Rough Notation jobs included in this release. `circle`, `underline`, and
`box` support opt-in finite reveal. `highlight` is static in this release because
an outline reveal would not reproduce a marker wash honestly. Stet also has
`arrow`, `sticky`, and `mark`; `mark(target, "wrong")` serves a crossed-off job,
but it is not API or geometry compatibility with Rough Notation's `crossed-off`.

```ts
import { box } from "@funsaized/stet";
import "@funsaized/stet/style.css";

const annotation = box(target, {
  visible: false,
  animate: true,
  animationDuration: 600,
});
await annotation.show();
annotation.hide();
annotation.destroy();
```

Stet is static by default. `visible` defaults to `true`; `animate` defaults to
`false`, although supplying `animationDuration` or `animationDelay` opts in unless
`animate: false` is explicit. Reveal timing must be finite and nonnegative.
`visible: false` defers the first reveal until `show()`. `show()` and `replay()`
resolve `{ status: "finished" | "cancelled" }`; `hide()` is immediate. Reduced
motion and zero duration settle immediately. Refresh, resize, scroll, fonts,
resketch, and ambient `boil` do not replay finite reveal.

Requesting reveal for `highlight`, `arrow`, `sticky`, or `mark` throws before Stet
changes DOM or ARIA. Their static handles still support show, hide, replay,
refresh, resketch, and destroy.

## Capability disposition

Upstream behavior is sourced from the Rough Notation README as retrieved on
2026-09-13. “Not in this release” is a limit, not a promised API or schedule.

| Rough Notation capability | First-release Stet disposition |
| --- | --- |
| Underline | Available as named `underline`; static by default, opt-in reveal. |
| Box | Available as named `box`; static by default, opt-in reveal. |
| Circle | Available as named `circle`; static by default, opt-in reveal. |
| Highlight | Available as named `highlight`; static only in this release. |
| Strike-through | Not in this release. |
| Crossed-off | Similar job via `mark(target, "wrong")`; not drop-in equivalent. |
| Bracket and selected bracket sides | Not in this release. |
| Default-on animation | Intentionally different: Stet defaults to static. |
| Animation duration | Available for the reveal subset; Stet defaults to 600 ms, not 800 ms. |
| Color | Use Stet's `stroke` for line ink and `fill` for highlight/note fill; defaults differ. |
| Stroke width | Use Stet's `width`; defaults differ. |
| Show and immediate hide | Available, but settled-visible `show()` does not redraw. Use `refresh()` after layout changes. |
| Reanimation by hide/show | Intentionally different: use explicit `replay()`. |
| `isShowing()` | Not in this release. |
| `remove()` | Intentionally named `destroy()`; no synonym is provided. |
| Ordered annotation groups | Not in this release; host code can await handles individually. |
| Mutable configuration properties | Not exposed; adapters update supported options through their lifecycle. |
| Per-side padding arrays | Not in this release; released padding is scalar. |
| Explicit multiline option | Not in this release; circle, underline, and highlight handle applicable wrapped text automatically. |
| Iterations | Not in this release. |
| RTL reveal direction | Not in this release. |
| `annotate(element, { type })` factory | Intentionally different: Stet keeps named primitive functions. |

For a crossed-off job, the Stet form is `mark(target, "wrong")`. Rough Notation
uses `annotate(target, { type: "crossed-off" })`. The intent is similar; option
names, geometry, defaults, and handles are not equivalent.

## Browser injection and delivery limits

The first-release Playwright session exposes `circle`, `underline`, `highlight`,
`arrow`, `sticky`, and `mark`. It does **not** expose `box` in this release even
though core and framework adapters do.

`@funsaized/stet/playwright` supports caller-owned Playwright `Page` objects and
same-origin `Frame` objects in Chromium and Firefox with Playwright `>=1.63 <2`.
WebKit is not claimed for the first release. Cross-origin or opaque frames,
detached frames, workers, browser contexts, element handles, locators as the
session context, and cross-document arrows are unsupported. Navigation
invalidates a session; Stet does not rediscover targets or reinject.

The helper loads package-local JavaScript and CSS through same-origin URLs. It
does not fetch a CDN, inline the payload, call `bypassCSP`, or weaken page policy.
A policy that blocks required same-origin script or style loading produces an
actionable `CSP_BLOCKED` error where detection is established; other asset
failures use `LOAD_FAILED`.

Use source authoring when an explanation belongs in the application or a reusable
preview. Use injection for a temporary artifact only when the installed artifact
actually exports the helper. If intended lifetime is ambiguous, ask whether the
explanation should remain in the application or exist only in the captured
handoff. Stet does not run an agent, edit source automatically, or perform QA.

Preview/local exclusion requires the tested Vite review-module boundary. Hidden
annotations, runtime no-ops, and runtime environment checks do not prove that
temporary code or copy is absent. Other bundlers, SSR pipelines, static-copy
steps, and deployments need equivalent output inspection before making the same
claim.

## Accessibility and placement limits

Stet preserves native elements and pointer behavior. Meaningful descriptions use
Stet-owned `aria-describedby` IDs; explicit hide detaches those IDs, show restores
them, and destroy removes only IDs owned by that handle. This behavior is tested,
but it is not screen-reader certification.

Arrow paths do not avoid intervening UI. Sticky notes and labels do not solve
global collisions. Top-layer dialogs, cross-document elements, transformed or
zoomed document roots, and some clipped containers are unsupported or constrained.
Shadow-root targeting is not established by the release matrix.

## Claim, source, and check map

| Claim | Approved/source record | Executable evidence |
| --- | --- | --- |
| Static default, timing validation, visibility, results, cancellation | `delivery/contracts/runtime.md` | `tests/stet.test.ts`, `tests/browser/reveal.spec.ts` |
| Reveal subset is circle, underline, and box | `delivery/contracts/runtime.md`; `delivery/evidence/BOX-02.md` | `tests/stet.test.ts`, `tests/browser/reveal.spec.ts` |
| Framework visibility/handle parity | `delivery/contracts/adapters.md` | `tests/react.test.ts`, `tests/vue.test.ts`, `tests/svelte.test.ts`, `tests/angular.test.ts`, `npm run test:templates`, `npm run test:patterns` |
| Injection contexts, engines, lifecycle, errors, and CSP | `delivery/contracts/playwright.md`; `delivery/evidence/PW-06.md` | `tests/pw01/` through `tests/pw06/` |
| Source/injection ownership and native behavior checks | `docs/playwright.md`; `delivery/evidence/PW-07.md`; `delivery/evidence/PW-08.md` | `tests/pw07/`, `tests/pw08/` |
| Shipping guarantees are separate and output-tested | `delivery/contracts/shipping.md`; `delivery/evidence/SHIP-03.md` | `tests/shipping/runtime.spec.ts`, `tests/shipping/inspect-output.mjs` |
| ARIA ownership | `delivery/contracts/runtime.md` | `tests/stet.test.ts`, `tests/browser/scroll.spec.ts` |
| Placement limits | `docs/product-direction.md` §4.5; `docs/reference.md` | Product boundary; scroll/culling coverage is in `tests/browser/scroll.spec.ts`. |
| Rough Notation comparison rows | [Rough Notation README](https://github.com/rough-stuff/rough-notation/blob/master/README.md) | Documentation comparison; Stet rows use the checks above. |

The remaining bracket, strike-through, padding, multiline/RTL, iterations, group,
and mutable-configuration work is outside this release. It must not be inferred
from this checklist.
