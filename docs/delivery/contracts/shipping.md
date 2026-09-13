# Shipping contract

Status: approved for first-release implementation

## Modes

| Mode | Module ownership and selection | Customer production output |
| --- | --- | --- |
| Production | Intentional annotations live in `stet/production.*` and are imported normally; review policy is `off`. | Production annotation code/copy and required Stet runtime/CSS remain. |
| Preview-only | All annotation code, copy, plans, and Stet/CSS imports live under `stet/review.*`; policy is `preview`. | Review module/content and otherwise-unused Stet runtime/CSS are absent. A build using the explicit preview mode includes and renders them. |
| Local-only | Same review ownership; policy is `local`. | Every emitted build excludes review content/runtime. The development server includes and renders it. |
| Disabled | No production boundary is imported and review policy is `off`; callers do not invoke retained annotation setup. | No annotation renders. Exclusion may also hold, but only the disabled guarantee is claimed unless output checks prove more. |
| Mixed | Intentional annotations stay in `stet/production.*`; temporary annotations stay in `stet/review.*` with `preview` or `local` policy. | Production annotations/runtime/CSS remain; temporary review module/copy/plans/review-only CSS do not. |

## Guarantees

1. **Disabled:** no annotation renders; code may remain.
2. **Runtime excluded:** unused Stet JavaScript and CSS are absent.
3. **Content excluded:** temporary annotation copy, plans, and setup are absent.

The first mechanism is an explicit review-only module/component boundary selected
at build time. It relies on normal bundling, not arbitrary JSX, Vue, Svelte, or
Angular rewriting.

## Explicit Vite boundary

The consumer owns three source boundaries (extensions/framework components may
vary):

- `src/stet/production.*` contains only intentional shipping annotations and is
  imported directly by application code when the production or mixed mode needs
  it.
- `src/stet/review.*` owns every temporary annotation import, stylesheet import,
  string, plan/JSON import, setup function, and framework component.
- `src/stet/review-boundary.ts` is the only application import of `review.*`. It
  conditionally performs `import("./review")` behind the compile-time boolean
  `__STET_REVIEW_BUILD__` and otherwise exposes a no-op with the same host-facing
  signature.

The review module is invoked only from a client lifecycle after targets exist; it
has no top-level DOM work. SSR may import the boundary, but a false boundary never
loads `review.*`, and the server render does not attach annotations.

Vite config owns a literal policy (`"off" | "preview" | "local"`) in source and
defines `__STET_REVIEW_BUILD__` to the JSON boolean result:

| Policy | `vite serve` | ordinary/customer `vite build` | `vite build --mode stet-preview` |
| --- | --- | --- | --- |
| `off` | `false` | `false` | `false` |
| `preview` | `false` | `false` | `true` |
| `local` | `true` | `false` | `false` |

Unknown policies fail configuration. `stet-preview` is an explicit build target,
not a client-readable `VITE_*` runtime flag. Deployment may select that command,
but an environment variable alone is not the shipping boundary. The constant must
be replaced with literal `true` or `false`; reading it dynamically or defining it
to a string is unsupported.

The boundary controls temporary code inclusion, not intentional annotations.
Production imports never pass through it. It does not rewrite component syntax or
turn existing calls into no-ops.

Output tests inspect emitted JavaScript, CSS, assets, reachable chunks, and
published source maps. Mixed builds must retain production annotations. A no-op
adapter does not prove content exclusion. The website's checkout aliases cannot be
used to prove packed-package behavior.

## Falsifiable output matrix

Each fixture gives production code/copy, review code/copy/plan, and review-only CSS
distinct sentinel strings. Tests build from a packed `@funsaized/stet` package,
set `build.manifest: true`, list every emitted file, and inspect all output plus
Vite's manifest/dynamic-import graph; checking only the entry chunk is
insufficient.

| Build | Browser assertion | Emitted JS/CSS/assets | Published source maps |
| --- | --- | --- | --- |
| Production | Intentional overlay renders and native behavior works; no review overlay. | Production sentinels and required Stet runtime/CSS present; all review sentinels/module/chunks/assets absent. | Production sources may remain; excluded review-module needles defined below are absent. |
| Preview-only preview | Review overlay renders and native behavior works. | Review module, copy/plan sentinel, review CSS, Stet runtime, and required Stet CSS present. | Review sources/content may remain. |
| Preview-only customer | No annotation renders; native behavior works. | Review module/chunks/copy/plan/CSS sentinels absent; Stet JS/CSS absent when there is no other Stet import. | No review-module `sources` entry or review sentinel in decoded map fields; the boundary may remain. |
| Local-only development | Review overlay renders in the served development module graph; native behavior works. | No production artifact claim; request/module-graph evidence proves the review module is served only in development. | Not applicable unless the dev server emits a map; any retained map is recorded, not published. |
| Local-only build | No annotation renders; native behavior works. | Same exclusions as preview-only customer for every build mode. | No review-module `sources` entry or review sentinel in decoded map fields; the boundary may remain. |
| Disabled | No annotation renders and native behavior works. | Code may remain; absence is not inferred from the runtime assertion. | No exclusion claim unless the sentinel scan also passes. |
| Mixed preview | Production and review overlays render; native behavior works. | Both sets of sentinels/modules and required Stet runtime/CSS are present. | Both source sets may remain. |
| Mixed local development | Production and review overlays render in the served graph; native behavior works. | No production-artifact claim; module-graph evidence includes both boundaries. | Not applicable unless the dev server emits a map. |
| Mixed customer | Intentional overlay renders; review overlay does not; native behavior works. | Production sentinels/runtime/CSS present; review module/chunks/copy/plan/CSS sentinels absent. | Production and boundary sources may remain; no review-module `sources` entry or review sentinel appears in decoded map fields. |

SSR/prerender fixtures apply the same matrix to both client and server output.
Customer builds scan the SSR bundle, client bundle, manifests, maps, assets, and
prerendered HTML for excluded needles; hydration renders no review overlay and
preserves native behavior. Preview builds may emit the review module in the client
and server graphs, but server rendering executes no annotation setup and
prerendered HTML contains no Stet-owned overlay; the review overlay appears only
after client hydration. Mixed SSR customer builds retain production-module
sentinels while excluding review needles. SSR is unsupported for a configuration
that cannot pass these equivalent output and hydration checks.

Output fixtures must run excluded builds with `build.sourcemap: "hidden"` and with
at least one of `true` or `"inline"`; `false` may be recorded additionally. Tests
discover external maps by listing output rather than relying on
`sourceMappingURL`, and decode inline map payloads. The always-imported
`review-boundary.ts` may appear in maps. Exclusion requires that no map `sources`
entry resolves to `stet/review.*`, and no decoded `sourcesContent`, `names`, or
inline payload contains a review sentinel. Raw `mappings` need not be empty.
Manifests must have no review entry or reachable review chunk in excluded builds.
Plan/content files copied independently through `publicDir`, static-copy plugins,
or deployment steps are outside tree-shaking and fail content exclusion if they
contain a review sentinel.

The three guarantees are accepted independently:

1. Disabled requires a browser test proving zero Stet-owned overlays/ARIA changes
   while the same native interaction passes.
2. Runtime excluded is claimed only for preview-only customer, local-only build,
   or another configuration with no retained Stet import. It requires that no
   emitted JavaScript, CSS, or decoded map
   contains Stet runtime/style needles (`stet-overlay`, `stet-description-`, or
   `--stet-stroke`); the manifest/dynamic-import graph has no review chunk or Stet
   CSS asset; and consumer source has no Stet/CSS import outside the declared
   production/review boundaries.
3. Content excluded requires review code/copy/plan/CSS sentinels absent from all
   artifacts and manifests, plus no review-module `sources` entry or review
   sentinel in decoded map fields. `review-boundary.ts` and its import specifier may
   remain.

## Unsupported configurations

- Temporary strings, plans, CSS, or Stet imports outside `review.*`.
- Static/top-level imports of `review.*`, including from production components or
  an SSR entry.
- Runtime-only environment checks, no-op adapters, or `visible: false` presented as
  runtime/content exclusion.
- Universal textual/AST stripping, automatic framework-source rewriting, and an
  unproven Vite plugin.
- Assuming another bundler, minifier, source-map processor, static-copy plugin, or
  deployment pipeline preserves these guarantees without equivalent output tests.
- CDN loading or website source aliases as package-consumer evidence.

A Vite plugin is a post-release, evidence-gated convenience. It is retained only
if the plain boundary causes repeated setup errors and it produces the same tested
output.
