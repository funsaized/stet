# Shipping boundaries

Do not promise to remove arbitrary annotations from application source. For Vite,
use the tested explicit boundary:

- intentional marks and their imports belong in the app-owned
  `src/stet/production.*`;
- every temporary Stet/CSS import, string, plan, and setup belongs in
  the app-owned `src/stet/review.*` with no top-level DOM work;
- only `src/stet/review-boundary.ts` may dynamically import `review.*`, behind a
  compile-time literal boolean;
- `off` always excludes review, `preview` includes it only for the explicit
  `stet-preview` build mode, and `local` includes it only in `vite serve`.

An environment flag, runtime condition, no-op adapter, `visible: false`, or plan
validation does not prove exclusion. Never add source rewriting or a Vite plugin.

Before claiming exclusion, build a packed-package consumer from clean output and
inspect all JS, CSS, assets, manifests, reachable chunks, and decoded hidden plus
published source maps. Prove disabled rendering, runtime exclusion, and temporary
content exclusion separately; mixed builds must retain intentional annotations.
The boundary source/name and its dynamic-import specifier may remain in maps;
temporary `review.*` sources and sentinels may not. The app-owned boundary paths
above are not `@funsaized/stet` package exports. Disabled runtime evidence proves
only the configured overlay counts and tested native interaction.
See the packaged `docs/shipping.md` for the complete tested recipe.
