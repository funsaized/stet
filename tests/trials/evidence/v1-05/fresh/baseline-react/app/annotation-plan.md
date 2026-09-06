# Settings annotation plan and verification

Implemented in the existing `App.tsx`, using only the installed Stet 0.0.2 README and public API declarations for package guidance.

| Annotation | Source evidence | Intended meaning and implementation |
| --- | --- | --- |
| Red circle on the native delete button | `App.tsx:41`: `type="button"`, confirmation prompt, and `setSaved(false)` | Draw attention to deletion. Accessible description: “Deletion requires confirmation. Review what will be removed below.” Attach via `deleteRef`; retain the existing handler and `aria-describedby="native-warning"`. |
| Highlight the existing warning | `App.tsx:42`: deletes saved settings on this device; account and documents are kept | Emphasize the exact scope in the existing text, including its wrapped lines. Attach via `warningRef`. |
| Arrow from warning to recovery paragraph | `App.tsx:43`: preferences can be set again; paragraph exists only for `destination > 0` and is keyed by `destination` | Connect consequences to recovery guidance using actual DOM refs. Accessible description: “After deletion, you can set your preferences again.” No floating text label, to keep the warning readable on narrow screens. |

`App.tsx:39–47` supplies no evidence that Save or the form examples are destructive. Those elements receive no annotations. The implementation makes no claims about account deletion, document loss, undo, or permanent loss. The actual handler only changes React state; the warning describes the application's intended deletion scope, not independently verified storage behavior.

Package evidence:

- `node_modules/@funsaized/stet/README.md:18–39` documents the core import, stylesheet, native control ownership, paragraph highlighting, arrows, and `destroy()` removing an annotation and its subscriptions.
- `node_modules/@funsaized/stet/README.md:42–43` documents still-by-default marks and seeded repeatability. Fixed seeds are used; optional animation is not enabled.
- `node_modules/@funsaized/stet/dist/primitives.d.ts:13–17` declares `circle`, `highlight`, and two-element `arrow`, each returning a `StetHandle`.
- `node_modules/@funsaized/stet/dist/mount.d.ts:2–18` declares `seed`, `stroke`, accessible `description`, and handle cleanup.

Lifecycle implementation (`App.tsx:7–36`): React refs target the existing elements. The effect runs after commit and depends on both `enabled` and `destination`. Its cleanup destroys every created handle before reattachment and on unmount. This resolves the current keyed destination node after replacement, removes the arrow when that node is absent, and recreates it when it returns. Disabled annotations leave native controls and warning intact. Partially completed setup also cleans up handles if a later annotation throws.

Verification:

- `npm run check` and `npm run build` passed after the final source edit. Both run this app's TypeScript check and browser bundling through `build.mjs`.
- `node verify-annotations.mjs` passed using the installed Chromium and Playwright, loading only the local built app with no server or network requests. Browser execution required sandbox escalation.
- Verified enabled/disabled transitions, repeated toggling without accumulating overlays, positive-to-positive keyed destination replacement, removal and return, cleanup on detached destination, and unmount cleanup.
- Verified all `aria-describedby` references resolve, the native warning ID remains on the button, and disabling restores its original description attribute.
- Verified the original delete DOM element survives updates, its bounding box is unchanged by annotations, and annotation overlays do not intercept pointer events.
- Verified required-field validation, Save submission, keyboard Tab order and Enter activation, deletion confirmation cancel/accept, status changes, and deletion not submitting the form.
- Verified entered workspace name and deletion state survive annotation updates, with no browser page errors.
- Visually reviewed final screenshots at 1000×800 and 390×844. Text remains readable; the arrow is short because the two paragraphs are adjacent.

Remaining limits: verification covers Chromium at those two viewport sizes, not other engines, all zoom levels, or assistive-technology speech output. React Strict Mode replay and memory/observer instrumentation were not independently tested. The existing placeholder-only email input remains unlabeled. Storage persistence is not implemented by the original App handler and was not added by this annotation work.
