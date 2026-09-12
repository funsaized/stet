# Shipping contract

Status: approved for first-release implementation

## Modes

| Mode | Result |
| --- | --- |
| Production | Intentional annotations ship |
| Preview-only | Review annotations ship only to previews |
| Local-only | Review annotations are available only in development |
| Mixed | Intentional production annotations remain; review annotations do not |

## Guarantees

1. **Disabled:** no annotation renders; code may remain.
2. **Runtime excluded:** unused Stet JavaScript and CSS are absent.
3. **Content excluded:** temporary annotation copy, plans, and setup are absent.

The first mechanism is an explicit review-only module/component boundary selected
at build time. It relies on normal bundling, not arbitrary JSX, Vue, Svelte, or
Angular rewriting.

Output tests inspect emitted JavaScript, CSS, assets, reachable chunks, and
published source maps. Mixed builds must retain production annotations. A no-op
adapter does not prove content exclusion. The website's checkout aliases cannot be
used to prove packed-package behavior.

A Vite plugin is a post-release, evidence-gated convenience. It is retained only
if the plain boundary causes repeated setup errors and it produces the same tested
output.
