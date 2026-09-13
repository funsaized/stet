# Runtime contract

Status: approved for implementation planning

## Options

```ts
visible?: boolean;
animate?: boolean;
animationDuration?: number;
animationDelay?: number;
```

- `visible` defaults to `true`.
- Animation defaults off. Supplying duration or delay opts in unless
  `animate: false` is explicit.
- Enabled duration defaults to 600 ms; delay defaults to 0 ms.
- Duration and delay must be finite and nonnegative.
- Zero duration ignores delay and settles immediately.
- Reduced motion settles immediately.
- Initial `visible: false` defers entrance until `show()`.
- First-release reveal supports `circle`, `underline`, and `box`.
- Unsupported animation fails before DOM or ARIA mutation.
- Easing, exit animation, reveal direction, and timelines are out of scope.

Option validation is synchronous during attachment. A non-finite or negative
duration/delay throws `RangeError`; requesting enabled animation on an unsupported
primitive throws `TypeError`. Cancellation is a normal result, not a rejection.

The options remain flat because the current schema generator supports scalars and
literal unions, not nested objects.

## Handle

```ts
type StetAnimationResult = { status: "finished" | "cancelled" };

interface StetHandle {
  show(): Promise<StetAnimationResult>;
  hide(): void;
  replay(): Promise<StetAnimationResult>;
  refresh(): void;
  resketch(seed?: number): void;
  destroy(): void;
}
```

## State rules

An operation is the delay plus reveal started by animated attach, `show()`, or
`replay()`. At most one operation exists per handle. Every operation promise
settles exactly once and never rejects for normal lifecycle interruption.

| Current state | Event | Result |
| --- | --- | --- |
| Attaching, `visible` omitted/true, animation disabled | Attach | Visible and settled; no operation is created. Existing static DOM and drawing behavior is unchanged. |
| Attaching, `visible` omitted/true, animation enabled | Attach | Visible; start exactly one entrance operation. |
| Attaching, `visible: false` | Attach | Explicitly hidden and settled; do not start an operation or expose owned ARIA relationships, even when animation is enabled, duration is zero, or reduced motion is active. |
| Delaying or revealing | `show()` | Return the exact same promise object (`===`); do not restart or extend the operation. This also applies when the operation came from attach or `replay()`. |
| Settled and visible | `show()` | Do not redraw or replay; return a newly created already-fulfilled `finished` promise. Promise identity is specified only while joining an operation. |
| Settled and explicitly hidden | `show()` | Always make visible and restore owned ARIA. Start a new operation when animation is enabled; otherwise return a newly created already-fulfilled `finished` promise. |
| Any non-destroyed state | `replay()` | Make visible, restore owned ARIA, and preserve the current seed. Cancel any prior operation, then start a distinct entrance operation when animation is enabled; otherwise settle visibly and return a newly created already-fulfilled `finished` promise. |
| Delaying or revealing | `replay()` | Settle the old promise as `cancelled` before the new operation can settle. A following `show()` joins the new replay promise. |
| Any non-destroyed state | `hide()` | Immediately set explicit hidden state and detach owned ARIA. If an operation exists, stop it and settle it `cancelled`. Repeated hides are no-ops. |
| Delaying or revealing | Reduced motion becomes active | Skip delay and remaining reveal, render the final visible state, and settle the existing operation `finished`. |
| Reduced motion active or zero duration | Animated attach that is not explicitly hidden, `show()`, or `replay()` | Reach the final visible state without waiting for delay and create no operation. Attach returns only the handle; `show()`/`replay()` (including from explicit hide) restore visibility/ARIA and return a newly created already-fulfilled `finished` promise. A later `show()` follows the settled-visible row. Initial `visible: false` attach still follows the hidden-attach row. |
| Any non-destroyed state | `destroy()` | Stop and settle any operation `cancelled` before teardown, detach owned ARIA, remove all Stet-owned DOM/listeners/observers, and enter destroyed state. Repeated destroy is a no-op. |
| Destroyed | `show()` or `replay()` | Return a newly created already-fulfilled `cancelled` promise. |
| Destroyed | `hide()`, `refresh()`, `resketch()`, or `destroy()` | No-op and do not throw. |

“Already fulfilled” means normal Promise microtask observation; these methods do
not synchronously return a result object. Once an operation is cancelled, late
timers, animation events, media changes, or redraws cannot change its result.

Explicit hidden state is cleared only by `show()` or `replay()` (or discarded by
`destroy()`). `refresh()`, `resketch()`, resize/intersection observers, scrolling,
fonts, theme changes, and viewport culling cannot make an explicitly hidden
annotation visible or restore its ARIA relationships.

`refresh`, `resketch`, layout observation, scrolling, fonts, and theme changes do
not replay. Viewport culling neither pauses nor starts animation. Offscreen
animation may finish offscreen; viewport-triggered reveal is a separate recipe.

During an operation, `refresh()` preserves the current seed and `resketch()` uses
the requested/new seed. Both redraw at the operation's current progress without
changing its start time, deadline, or promise. Replacing drawn nodes must not
restart the delay or reveal. Ambient `boil` and hover resketching follow the same
rule. A target that is offscreen, has no client rectangles, or is temporarily
detached is culled but does not pause or cancel an operation. Reconnection exposes
the current or final frame. For multi-target annotations, culling either endpoint
culls the whole annotation. Target replacement is an adapter update, not DOM
detachment; it follows the update rule below.

## Accessibility ownership

- Explicit hide detaches every Stet-owned `aria-describedby` relationship.
- Show restores those relationships.
- Viewport culling preserves them.
- Destroy removes them.
- Existing native and other annotation IDs are preserved.
- This includes mount descriptions, arrow labels, and sticky text.

Initial `visible: false` follows the explicit-hide rule. Descriptive nodes may stay
in Stet's overlay while hidden, but their IDs are absent from target
`aria-describedby` values. Restoring visibility appends each missing owned ID once
without removing, reordering, or duplicating foreign IDs. If application code
changes `aria-describedby` while Stet is hidden or visible, later hide/destroy
removes only IDs owned by that handle. Viewport/detachment culling is not explicit
hiding and therefore preserves relationships.

`arrow` and `sticky` return the complete handle without dropping methods. Arrow
labels describe the destination target; sticky text describes its target. Their
label/text relationships obey the same initial hide, hide, show, replay, and
destroy rules as `description` on mount. Animation options on these unsupported
first-release primitives fail during attachment as stated above; their static
handles still support immediate show, hide, and replay.

## Updates

The first release needs an internal nonreplaying update path, not a public generic
`update()` method. Styling, text, and placement updates preserve current visibility
and do not start a fresh entrance. Animation settings affect the next entrance.
Target replacement cancels the old handle and applies normal initial attachment to
the new target.

## Executable test map

| Contract behavior | Required check |
| --- | --- |
| Option defaults, validation, unsupported reveal, and no pre-error DOM/ARIA mutation | Unit table in `tests/stet.test.ts` for omitted/explicit options, negative/non-finite timing, and every unsupported primitive. |
| Static compatibility and immediate static show/replay | Unit assertions for unchanged paths/DOM, no document animations, static hide then show restoring visibility/ARIA, settled-visible show returning a distinct new `finished` promise without redraw, and fulfilled replay preserving the seed; retain current browser static screenshots. |
| Animated attach, hidden attach, show joining, and show after hide | Fake-time unit state table asserting operation count, exact in-flight promise identity, results, visibility, and ARIA; hidden attach wins over zero duration/reduced motion and instant-finish attach leaves no joinable operation. |
| Replay while settled, hidden, delaying, and revealing | Fake-time unit state table asserting the old result is `cancelled`, the new promise is distinct, and a subsequent show joins it. |
| Hide/destroy interruption and all post-destroy calls | Fake-time unit checks proving immediate visibility/cleanup, exactly-once cancellation, harmless void calls, and no late `finished`. |
| Zero duration and reduced motion initially/mid-operation | Unit media-change checks plus a browser preference-change case proving immediate final state and `finished`. |
| Refresh, resketch, resize, scroll, fonts, theme, boil, and hover during reveal | Unit fake-time checks for unchanged operation identity/deadline and updated geometry; browser check for no replay or variant flash. |
| Offscreen, detached/reconnected, and multi-target culling | Browser cases extending `tests/browser/scroll.spec.ts`; operation completes while culled and ARIA remains unless explicitly hidden. Existing overflow-clipping behavior is unchanged and is not promoted to a new culling rule. |
| Explicit hide versus observer visibility | Unit/browser check that hide survives intersection, resize, scroll, fonts, theme, refresh, and resketch until `show()` or `replay()`. |
| Description ownership through hide/show/replay/destroy | Unit checks extending the existing independent/later-added ARIA test for mount descriptions, arrow labels, and sticky text. |
| Arrow/sticky wrapper completeness | Compile-time/runtime unit check that both wrappers expose every `StetHandle` method and preserve their target-specific ARIA ownership. |
| Adapter target replacement | Adapter lifecycle tests proving old-operation cancellation and normal initialization on the replacement target; detailed adapter behavior is in `adapters.md`. |
