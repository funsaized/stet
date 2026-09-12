# Playwright integration contract

Status: approved product boundary; loading details are evidence-gated by `PW-01`
and `PW-02`

## Package boundary

- Ship a supported optional `@funsaized/stet/playwright` entry.
- Build its browser payload while building Stet.
- Load package-local assets; never fetch a CDN.
- Consumers do not need esbuild.
- Callers supply their own Playwright installation and objects.
- Browser-core graphs contain no Node or Playwright code.

The entry has an optional `@playwright/test` peer used for types only; the first
release supports `>=1.63 <2`. It has no runtime dependency on Playwright and does
not require consumers to import Stet's browser core themselves.

## Public API

```ts
import type { Frame, Locator, Page } from "@playwright/test";
import type {
  ArrowOptions,
  MarkKind,
  StetAnimationResult,
  StetOptions,
  StickyOptions,
} from "@funsaized/stet";

export function createStet(context: Page | Frame): Promise<StetSession>;

export interface StetSession {
  circle(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  underline(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  highlight(target: Locator, options?: StetOptions): Promise<RemoteStetHandle>;
  arrow(from: Locator, to: Locator, options?: ArrowOptions): Promise<RemoteStetHandle>;
  sticky(target: Locator, options: StickyOptions): Promise<RemoteStetHandle>;
  mark(target: Locator, kind: MarkKind, options?: StetOptions): Promise<RemoteStetHandle>;
  dispose(): Promise<void>;
}

export interface RemoteStetHandle {
  show(): Promise<StetAnimationResult>;
  hide(): Promise<void>;
  replay(): Promise<StetAnimationResult>;
  refresh(): Promise<void>;
  resketch(seed?: number): Promise<void>;
  destroy(): Promise<void>;
}

export type StetPlaywrightErrorCode =
  | "UNSUPPORTED_CONTEXT" | "FRAME_DETACHED" | "TARGET_MISSING"
  | "TARGET_AMBIGUOUS" | "TARGET_DETACHED" | "WRONG_DOCUMENT"
  | "NAVIGATION" | "PAGE_CLOSED" | "SESSION_DISPOSED" | "LOAD_FAILED"
  | "CSP_BLOCKED" | "INVALID_OPTIONS" | "UNSUPPORTED_ANIMATION"
  | "BROWSER_OPERATION";

export class StetPlaywrightError extends Error {
  readonly code: StetPlaywrightErrorCode;
  readonly primitive?: "circle" | "underline" | "highlight" | "arrow" | "sticky" | "mark";
  readonly role?: "target" | "from" | "to";
}
```

Remote methods are asynchronous because they cross the Playwright/browser
boundary. `show()` and `replay()` preserve the runtime's `finished`/`cancelled`
results and in-flight operation joining; normal runtime interruption does not
reject. Other methods resolve after their browser-side effect. Calls on a remotely
destroyed handle follow the runtime's destroyed-handle behavior. Calls after
session `dispose()` behave as calls on destroyed handles; repeated handle destroy
and session dispose resolve successfully. Primitive attachment methods resolve as
soon as the remote handle exists; they do not await an animated entrance. A
following `show()` joins an entrance still in flight from attachment.

Each session starts attach, method, and disposal requests in call order, without
sharing a queue across sessions. A `show()` that joins an in-flight operation
returns the exact same Node-side Promise object (`===`), sends no second browser
command, and does not restart. `hide()`, `replay()`, `refresh()`, `resketch()`,
`destroy()`, and `dispose()` can run while a show/replay promise is awaiting so
they can interrupt it under the runtime contract. Navigation is not an annotation
operation.

## Behavior

- Create an owned annotation session for a `Page` or same-origin `Frame`.
- Accept Playwright locators and require exactly one live target at attachment.
- Validate that targets belong to the session document.
- Expose asynchronous remote handles matching the runtime result semantics.
- Multiple sessions and source-authored Stet annotations coexist.
- Cleanup removes only resources owned by that session.
- Navigation, frame detachment, or page/context loss rejects affected pending
  helper calls, invalidates the session, and is never runtime `cancelled`.
- Do not automatically reinject, rediscover targets, or cross documents.
- Cross-document arrows and cross-origin frames are unsupported initially.
- Do not silently enable CSP bypass.

`createStet(page)` binds to the page's current main-frame document;
`createStet(frame)` binds to that frame's current document. Frame support requires
the frame document to be same-origin with its page's main-frame document,
including inherited-origin `about:blank`. Detached frames, workers, browser
contexts, element handles, and cross-origin frames are rejected. Navigating the
bound page/frame invalidates the session permanently; callers create a new session
explicitly for the new document. There is no automatic reinjection.

An attachment call takes a non-waiting snapshot of current locator matches using
`count()` or an equivalent operation: no action timeout, Stet retry, or live
retargeting follows that snapshot. For each locator, the first failing check wins:
wrong frame/document is `WRONG_DOCUMENT`; zero matches is `TARGET_MISSING`; more
than one is `TARGET_AMBIGUOUS`; and the one selected Element detaching before
attachment finishes is `TARGET_DETACHED`. It must be a connected Element in the
bound document at attachment. Arrows snapshot `from` and then `to`, apply the same
ordered checks with those roles, and do not attach if either fails. Later target
replacement or detachment never retargets the annotation; runtime culling applies
until explicit handle/session cleanup or document invalidation.

The helper assigns an opaque owner per session and tracks only that owner's remote
handles. Destroying a handle removes only that handle. `dispose()` destroys all
remaining owned handles. Loader-resource lifetime remains evidence-gated, but
cleanup may not remove resources or annotations still owned by another helper
session, and source-authored Stet overlays/descriptions are never adopted or
removed. A failed creation or attachment rolls back mutations made for that
attempt.

Navigation, frame detachment, page closure, or browser-context loss rejects an
affected in-flight helper call; it is not reported as runtime `{ status:
"cancelled" }`. The invalidated session rejects later attachment/handle method
calls, except idempotent `dispose()` which resolves. If the browser realm remains
available and `hide()`, `replay()`, `destroy()`, or `dispose()` interrupts a reveal,
the runtime cancellation result remains normal.

After `dispose()`, session primitive methods reject `SESSION_DISPOSED` without
resolving locators or mutating the page. Existing remote handles retain the
destroyed-handle behavior above.

Missing, ambiguous, detached, wrong-document, navigation, loading, and CSP failures
must be distinguishable and actionable. Normal runtime animation cancellation is
not an exceptional browser error.

## Errors

All helper failures use `StetPlaywrightError`, retain a cause when available, and
have one stable `code`:

| Code | Meaning |
| --- | --- |
| `UNSUPPORTED_CONTEXT` | Input is not a supported Page/Frame or a frame is cross-origin. |
| `FRAME_DETACHED` | The bound frame detached before the requested operation completed. |
| `TARGET_MISSING` | A locator matched no element at its single resolution point. |
| `TARGET_AMBIGUOUS` | A locator matched more than one element. |
| `TARGET_DETACHED` | The selected element detached before attachment completed. |
| `WRONG_DOCUMENT` | A locator/element belongs to a document other than the session document, including either endpoint of an arrow. |
| `NAVIGATION` | The bound document changed during or before an operation. |
| `PAGE_CLOSED` | The page/browser context became unavailable without a usable document. |
| `SESSION_DISPOSED` | A primitive attachment was requested after session disposal. |
| `LOAD_FAILED` | Package-local renderer or stylesheet resources could not be loaded for a reason not classified more specifically. |
| `CSP_BLOCKED` | The evidence-selected loader detected that page policy blocked a required resource or execution step. No bypass is enabled. |
| `INVALID_OPTIONS` | Runtime option validation failed. |
| `UNSUPPORTED_ANIMATION` | Animation was requested for a primitive without first-release reveal support. |
| `BROWSER_OPERATION` | Another Playwright/browser evaluation failed; the message identifies the operation and preserves its cause. |

Target errors identify the primitive and locator role (`target`, `from`, or `to`)
without serializing page content. Loading and CSP errors include a recovery hint
derived from PW-01/PW-02 evidence; the contract does not prescribe that hint or
claim all browser policy failures can be distinguished until those gates pass.
Runtime `RangeError`/validation `TypeError` maps to `INVALID_OPTIONS`; the specific
unsupported-reveal `TypeError` maps to `UNSUPPORTED_ANIMATION`, preserving causes.
`BROWSER_OPERATION` is residual and cannot replace a more specific code.

## Acceptance matrix

| Case | Required result |
| --- | --- |
| Page main document / same-origin Frame | Session creation and all six primitive methods are available. |
| Object is not a live Page/Frame, including worker, context, ElementHandle, Locator, or FrameLocator | Reject `UNSUPPORTED_CONTEXT`; no mutation. |
| Cross-origin/sandboxed-unique-origin Frame, or Frame detached at creation | Reject `UNSUPPORTED_CONTEXT`; no mutation. |
| Bound Frame later detaches | Reject `FRAME_DETACHED` and invalidate the session. |
| Page/context is already closed or later closes without a usable document | Reject `PAGE_CLOSED`; no mutation or further use. |
| One live locator target | Attach once and return an owned remote handle. |
| Zero / multiple / race-detached / other-document target | Reject with the corresponding target code and roll back that attempt. |
| Arrow endpoints in different documents | Reject `WRONG_DOCUMENT`; cross-document arrows are not attempted. |
| Runtime finish / hide, replay, destroy cancellation | Resolve `finished` or `cancelled` exactly as the runtime contract specifies. |
| Attach starts a reveal | Attachment resolves with the handle before reveal completion; `show()` can join it. |
| In-flight remote show plus another show | Return the same Node-side promise and settle once with the runtime result. |
| In-flight show plus hide/destroy/dispose while browser lives | Interrupt immediately and resolve the reveal `cancelled`, not a browser error. |
| Navigation, frame detachment, or page closure during a call | Reject with browser-lifecycle code, invalidate the session, and never translate it to normal cancellation. |
| Multiple helper sessions plus source-authored Stet | Independent handles and cleanup; disposing one leaves all foreign annotations/resources intact. |
| Repeated destroy/dispose | Resolve without affecting foreign ownership. |
| Primitive attachment after dispose | Reject `SESSION_DISPOSED` immediately. |
| Missing locator while Playwright default timeout is armed | Reject `TARGET_MISSING` from the non-waiting snapshot rather than waiting for an action timeout. |
| Restrictive CSP or package-resource load failure | Succeed only where PW evidence proves support; otherwise reject actionable `CSP_BLOCKED`/`LOAD_FAILED`, with rollback and no bypass. |
| Consumer package | Subpath types/runtime/assets resolve from a packed package without consumer esbuild; browser core remains free of Node/Playwright modules. |

## Evidence gates

`PW-01` must prove renderer and stylesheet loading, restrictive-CSP behavior,
Chromium and Firefox, same-origin frames, rollback, and source-authored
coexistence. WebKit evidence may be collected with `STET_WEBKIT=1`, but is not a
first-release support gate unless that run is made mandatory before release.

`PW-02` must prove packed payload discovery, no consumer bundler dependency,
navigation cancellation, cleanup ownership, and browser-core isolation.

The exact renderer transport, stylesheet transport, resource lifetime, and the
boundary between detectable CSP and generic load failures remain exclusively for
PW-01/PW-02 evidence. No worker may invent or document the final loader before
both gates are accepted; all public signatures and observable outcomes above are
independent of that mechanism.
