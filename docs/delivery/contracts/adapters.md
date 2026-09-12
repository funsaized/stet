# Framework adapter contract

Status: approved behavior; exact framework syntax is finalized by `CONTRACT-02`

Every existing adapter supports declarative visibility and access to the complete
runtime handle through adapter-only metadata:

```ts
onHandle?: (handle: StetHandle | null) => void;
```

`onHandle` is not a runtime option and never appears in plans or generated option
schemas.

Adapter code removes `onHandle` before passing options to a primitive or the
internal update path. It is callable metadata, so JSON plans, capability schemas,
CLI snippets generated from plans, and serialized option snapshots never contain
it.

## Shared rules

- Notify with a handle after attachment and `null` when it becomes unavailable.
- Changing callback identity does not remount or replay.
- A changed declarative `visible` value calls `show()` or `hide()`.
- An unchanged value does not overwrite an imperative show/hide operation.
- Nonvisibility updates use the internal update path and do not replay.
- Animation-option changes apply to the next entrance.
- Target replacement cancels the old handle and attaches a new one.
- Unmount/destruction reports `null` and performs idempotent cleanup.
- Existing SSR, hydration, StrictMode, directive, and action behavior remains.

Initial `visible` is passed into attachment; adapters do not call `show()` or
`hide()` again after mounting. On later renders/updates, only a changed boolean
value invokes the corresponding method exactly once. Omitted `visible` has the
runtime default `true`; changing from an explicit value to omission is a change to
`true`. This comparison is against the last declarative value, not current
imperative state, so unrelated updates cannot undo an imperative show/hide.

Callbacks run after attachment and receive the complete handle. A target
replacement or unmount first destroys the old handle, then sends `null` to the
callback that received it. Attachment of a replacement then sends the new handle
to the current callback. Changing only callback identity sends `null` to the old
callback and the existing handle to the new callback without update, remount, or
adapter-initiated replay. Changing between omitted and present performs the
corresponding single notification. Authors must use a stable callback when a
non-null notification causes an imperative operation; the examples below do so.
Omitted callbacks do nothing. Adapters commit their own state before calling user
callbacks and do not swallow callback exceptions.

All non-target runtime option changes use the source-only
`updateHandle(handle, nextOptions)` function from `src/mount.ts`. Adapters import
it directly; it is not re-exported by a package entry and is absent from
`StetHandle`. Each handle carries the module-private capability used by this
function; no handle-to-controller map or registry is created. `nextOptions` is a
complete snapshotted runtime option object excluding `visible` and `onHandle`, not
a patch, so removed values return to defaults. It applies appearance,
`resketchOnHover`, description, primitive-specific text/placement, seed, and
mark-kind changes without replacing the handle. It preserves
explicit visibility and any operation promise/deadline; a seed change redraws at
current progress. `animate`, `animationDuration`, and `animationDelay` are included
but affect only the next entrance. Declarative `visible` and adapter-only
`onHandle` are handled separately and never enter this operation.

For arrows, changing `to` is target replacement. For React, changing the element
held by `target`, `from`, or `to` is target replacement even when ref-object
identity is stable. Other option changes, including sticky text/side, arrow label/
curvature, and mark kind, are internal updates.

Every adapter processes attachment and host updates with the same algorithm:

1. Resolve every required target. With no live handle and any missing target, do
   nothing and do not notify `null`. With a live handle and any missing target,
   destroy it, notify the callback that received it with `null`, and stop. With no
   live handle and all targets present, attach using current options (including
   declarative visibility, omission meaning `true`), notify the current callback
   with the handle, and stop without a preceding `null`. With a live handle and
   changed target identity, destroy it, notify its callback with `null`, attach to
   the new targets using current options, notify the current callback with the new
   handle, and stop. Imperative visibility does not carry to a new handle.
2. Otherwise, if non-target runtime options changed, call `updateHandle` with the
   complete current snapshot excluding `visible` and `onHandle`.
3. If declarative visibility changed, call `show()` or `hide()` once. This runs
   after step 2 so new animation settings apply to that entrance.
4. If callback identity changed, perform the callback transfer above. A target
   replacement already performed its notifications and does not repeat this step.

Required targets are React `target`, and both `from` and `to` for React arrows;
arrow `to` for the other adapters; and the directive/action host, which exists
while Vue, Svelte, or Angular invokes the adapter. `updateHandle` receives only
primitive runtime options: adapters also strip `target`, `from`, and `to` along
with `visible` and `onHandle`. An unchanged arrow `to` is not an update field; a
changed `to` follows step 1.

## Exact framework syntax

### React 18+

Every component's props add `onHandle`; `visible` remains the flat runtime option.

```tsx
const handle = useRef<StetHandle | null>(null);
const onHandle = useCallback((next: StetHandle | null) => {
  handle.current = next;
}, []);

<Circle
  target={target}
  visible={isVisible}
  onHandle={onHandle}
/>

await handle.current?.replay();
```

The callback prop is excluded from option equality. StrictMode setup/cleanup uses
the same destroy-then-`null` ordering; each delivered handle receives one matching
`null` notification.

### Vue 3 directive

Directive metadata shares the binding object but is stripped before runtime use.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { vStetCircle } from "@funsaized/stet/vue";
import type { StetHandle } from "@funsaized/stet";

const visible = ref(false);
const handle = ref<StetHandle | null>(null);
const onHandle = (next: StetHandle | null) => { handle.value = next; };
</script>

<template>
  <button v-stet-circle="{ visible, onHandle }">
    Save
  </button>
</template>
```

The directive snapshots the unwrapped binding values. In-place reactive edits are
compared to that snapshot; callback identity transfer follows the shared rule.

### Svelte 5 action

`onHandle` is part of the action parameter metadata and is not forwarded.

```svelte
<script lang="ts">
  import { circle } from "@funsaized/stet/svelte";
  import type { StetHandle } from "@funsaized/stet";

  let visible = $state(false);
  let handle = $state<StetHandle | null>(null);
  const onHandle = (next: StetHandle | null) => { handle = next; };
</script>

<button use:circle={{ visible, onHandle }}>Save</button>
```

Action `update()` snapshots values and follows the shared changed-only rules. Its
`destroy()` destroys the handle before notifying `null`.

### Angular standalone directive

Angular uses a separate inherited callback input so the primary options input
stays serializable. The same input works with every Stet directive.

```ts
handle: StetHandle | null = null;
readonly onStetHandle = (next: StetHandle | null) => { this.handle = next; };
```

```html
<button
  [stetCircle]="{ visible: annotationVisible }"
  [stetOnHandle]="onStetHandle"
>Save</button>
```

`stetOnHandle` implements the shared `onHandle` callback contract but is not part
of `StetOptions`. Angular follows the shared update algorithm and
destroy-then-`null` ordering.

Framework syntax must remain idiomatic for React 18+, Vue directives, Svelte
actions, and Angular standalone directives. No adapter-specific animation engine
or controller registry may be introduced.

Template sources are `agent/snippets.mjs` and `agent/patterns.mjs`; generated files
under `agent/templates/` are never edited by hand.
