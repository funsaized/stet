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

| Event | Result |
| --- | --- |
| Static attach | Visible and settled |
| Animated attach | One entrance |
| Hidden attach | No entrance until shown |
| Show during entrance | Same in-flight promise; no restart |
| Show while settled-visible | Immediate `finished` |
| Show after hide | New entrance if enabled |
| Replay | Visible, restart; prior operation becomes `cancelled` |
| Hide during entrance | Immediate hide; pending result `cancelled` |
| Destroy during entrance | Cleanup; pending result `cancelled` |
| Reduced motion during entrance | Final state; result `finished` |
| Calls after destroy | show/replay return `cancelled`; others are harmless |

`refresh`, `resketch`, layout observation, scrolling, fonts, and theme changes do
not replay. Viewport culling neither pauses nor starts animation. Offscreen
animation may finish offscreen; viewport-triggered reveal is a separate recipe.

## Accessibility ownership

- Explicit hide detaches every Stet-owned `aria-describedby` relationship.
- Show restores those relationships.
- Viewport culling preserves them.
- Destroy removes them.
- Existing native and other annotation IDs are preserved.
- This includes mount descriptions, arrow labels, and sticky text.

## Updates

The first release needs an internal nonreplaying update path, not a public generic
`update()` method. Styling, text, and placement updates preserve current visibility
and do not start a fresh entrance. Animation settings affect the next entrance.
Target replacement cancels the old handle and applies normal initial attachment to
the new target.
