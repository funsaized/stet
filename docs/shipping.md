# Shipping annotations with Vite

Stet does not strip annotations from application source. Choose what ships by
putting temporary review annotations behind an explicit module boundary that
Vite can eliminate at build time. Keep intentional production annotations
outside that boundary.

## Choose a mode

| Policy | Development server | Customer build | `vite build --mode stet-preview` |
| --- | --- | --- | --- |
| `off` | Review module excluded | Review module excluded | Review module excluded |
| `preview` | Review module excluded | Review module excluded | Review module included |
| `local` | Review module included | Review module excluded | Review module excluded |

Production annotations import the app-owned `src/stet/production` module directly.
Preview-only and local-only applications call only their app-owned
`src/stet/review-boundary`. Mixed applications do both. These are application
files, not `@funsaized/stet` package exports. A disabled application imports
neither annotation setup; that proves only that no annotation renders, not that
code is absent.

## Own the boundary

Put every temporary Stet import, stylesheet, annotation string, plan, and setup
function in `src/stet/review.*`. It must have no top-level DOM work. Make this the
only application import of that module:

```ts
declare const __STET_REVIEW_BUILD__: boolean;

export async function mountReviewBoundary(): Promise<() => void> {
  if (!__STET_REVIEW_BUILD__) return () => {};
  const { mountReview } = await import("./review");
  return mountReview();
}
```

Set the constant to a literal boolean in Vite configuration. This tested policy
helper rejects unknown values:

```ts
import { defineConfig } from "vite";

const policy = "preview"; // "off" | "preview" | "local"

export default defineConfig(({ command, mode }) => ({
  define: {
    __STET_REVIEW_BUILD__: JSON.stringify(
      policy === "preview"
        ? mode === "stet-preview"
        : policy === "local"
          ? command === "serve"
          : policy === "off"
            ? false
            : (() => {
                throw new Error(`Unknown Stet review policy: ${policy}`);
              })(),
    ),
  },
}));
```

Call the boundary from client lifecycle code after targets exist. Do not use a
client-readable `VITE_*` environment value, a runtime-only check, a no-op adapter,
or `visible: false` as an exclusion mechanism. An environment variable alone does
not select the explicit preview build. No plugin or source rewriting is required.

## Verify emitted output

Build from the packed package used by customers. Enable `build.manifest`, delete
the old output first, and inspect every emitted JavaScript, CSS, asset, manifest
entry, reachable dynamic chunk, and source map. Test excluded builds with hidden
maps and with published external or inline maps; decode `sources`,
`sourcesContent`, and `names` rather than searching only the entry chunk. The
always-imported `review-boundary.ts`, its `import("./review")` specifier, and raw
source-map mappings may remain. Exclusion applies to `review.*` module paths and
temporary sentinels/content, not to the boundary's name.

Claim guarantees separately:

1. **Disabled:** a browser test finds no configured circle or underline overlay
   while the fixture's native button click still passes. This alone makes no
   exclusion claim.
2. **Runtime excluded:** builds with no retained Stet import contain no Stet JS/CSS
   or runtime/style needles, and their manifest has no review chunk.
3. **Content excluded:** temporary module paths, strings, plans, CSS sentinels, and
   decoded map content are absent from all output. Mixed builds must still contain
   the intentional production sentinels and Stet runtime/CSS.

The executable Vite fixture is under `tests/shipping/fixture`; its browser matrix
runs with `playwright.shipping.config.ts`, and `tests/shipping/inspect-output.mjs`
implements the artifact checks. Equivalent evidence is required before making
these claims for SSR, another bundler, static-copy tooling, or a deployment
pipeline.
