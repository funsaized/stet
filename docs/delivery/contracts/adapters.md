# Framework adapter contract

Status: approved behavior; exact framework syntax is finalized by `CONTRACT-02`

Every existing adapter supports declarative visibility and access to the complete
runtime handle through adapter-only metadata:

```ts
onHandle?: (handle: StetHandle | null) => void;
```

`onHandle` is not a runtime option and never appears in plans or generated option
schemas.

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

Framework syntax must remain idiomatic for React 18+, Vue directives, Svelte
actions, and Angular standalone directives. No adapter-specific animation engine
or controller registry may be introduced.

Template sources are `agent/snippets.mjs` and `agent/patterns.mjs`; generated files
under `agent/templates/` are never edited by hand.
