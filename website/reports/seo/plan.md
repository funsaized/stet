# SEO audit and implementation backlog — 2026-09-09

## Observed baseline (before implementation)

The checkout has 11 public URLs: five top-level pages and six scenarios in
`src/showcase/scenarios.ts`. All pages are eagerly imported by App.tsx. Vite emits
one empty React root. usePageMeta updates only title, canonical and OG URL in an
effect; descriptions and social titles remain shared. `/use-cases` incorrectly
canonicalizes to the first scenario. Scenario H1s are identical. The wildcard
scenario also silently displays the first scenario for unknown slugs.

Production GET/HEAD checks confirm apex HTTPS → 308 → HTTPS www → 200.
HTTP www → 308 → HTTPS www. Unknown URL → 200 with the identical 1,686-byte shell.
Vercel sends HSTS, nosniff, strict-origin-when-cross-origin and revalidation headers.
**Selected canonical: https://www.stetkit.com**, matching the established redirect.
Repository metadata currently disagrees. Raw/per-route rendered evidence is in
before-production.json. Analytics G-NECYZ55K84 is enabled asynchronously in source;
the website README incorrectly says there are no analytics.

## Search intent research

Qualitative search sampling, not volume estimates. Broad annotation queries mix
text annotation, screenshot tools, drawing canvases and SAP metadata. Narrow live
DOM/framework intent is a better match.

| Query cluster                                            | Intent / observed category                                                                                                                              | Stet relevance                                          | Destination / gap                                   | Priority |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- | -------- |
| UI annotation library, hand drawn JavaScript annotations | Install a DOM library; [Rough Notation](https://roughnotation.com/) and [React wrapper](https://www.npmjs.com/package/react-rough-notation)             | Strong: existing elements and sketches                  | Homepage category clarity; JavaScript docs          | P0/P1    |
| React / Vue / Svelte / Angular annotation library        | Integration and lifecycle examples                                                                                                                      | Strong                                                  | New framework docs drawn from canonical templates   | P1       |
| highlight DOM elements, UI callouts                      | Context help or tours; [Driver.js](https://driverjs.com/docs/simple-highlight)                                                                          | Partial: emphasis, not a tour engine                    | Playground, guided tutorial; clarify app owns steps | P1       |
| coding agent UI review / visual handoff                  | Feedback-to-agent tools such as [Agentation](https://www.agentation.com/) and [agent-ui-annotation](https://github.com/YeomansIII/agent-ui-annotation/) | Strong for agent-authored marks; not a feedback backend | Existing agent workflow + form review               | P1       |
| annotate live UI documentation                           | Explain working controls                                                                                                                                | Strong, narrower intent                                 | Existing live documentation scenario                | P1       |
| visual QA / UX annotation tool                           | Often screenshots, collaboration or automated checking                                                                                                  | Partial; Stet visualizes findings, does not test        | Form review with explicit limits                    | P1       |
| hand drawn React components                              | Often replacement component libraries                                                                                                                   | Weak for that intent                                    | Explain overlays; no new landing page               | Defer    |

No new category/QA/live-doc articles: existing destinations already answer these
intents and avoid competing duplicates. No framework × primitive page matrix.
No llms.txt ranking claim; canonical capability/schema links are more useful here.

## Prioritized backlog (recorded before implementation)

| Priority / problem       | Evidence                                       | Proposed change and implementation                                         | Expected benefit                     | Acceptance / verification                                                  |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| P0 rendering             | Empty initial React root                       | Build-time React server rendering using existing router; hydrate same tree | Independently crawlable routes       | Built HTML has route H1 and substantive text; no-JS browser tests          |
| P0 canonical             | Apex redirects to www but tags reverse it      | One www origin; host redirect, clean URLs, no trailing slash               | Consistent consolidation             | All canonical/OG/schema/sitemap URLs agree; redirect checks                |
| P0 metadata architecture | Partial effects, duplicated route declarations | Route manifest derived from scenarios and framework definitions            | Unique intent-specific previews      | Unique titles/descriptions, canonical per route in raw HTML and navigation |
| P0 sitemap/tests/404     | Manual sitemap and blanket rewrite             | Generate sitemap and static 404; remove SPA catch-all                      | No soft 404s or route drift          | Set equality, HTTP unknown=404, noindex on error                           |
| P1 framework docs        | Five integrations hidden behind tabs           | Five pages using generated circle/lifecycle templates                      | Useful framework entry points        | Unique framework API/lifecycle prose; canonical source examples            |
| P1 use cases             | Shared H1, existing rich demos                 | Individual intros, context and related docs                                | Direct search landing pages          | Unique H1, meaningful text, demos still pass                               |
| P1 structured data       | None                                           | WebSite, SoftwareApplication, BreadcrumbList                               | Machine-readable identity/hierarchy  | Local structural/property validation                                       |
| P1 linking               | Framework tabs are controls, not destinations  | Docs index and contextual framework/scenario links                         | Crawlable navigation graph           | Every route reachable; internal targets valid                              |
| P1 performance           | All pages eager in one bundle                  | Router lazy page imports; SSR preloads active route                        | Avoid unrelated route JS             | Compare request bytes, Lighthouse, hydration errors                        |
| P1 ecosystem             | npm homepage is README                         | Product homepage, precise description/keywords, README links               | Clear package identity               | Package checks; host consistency test                                      |
| P2 evergreen             | Existing strong destinations                   | Defer duplicative articles                                                 | Preserve focus                       | Intent map reviewed against final routes                                   |
| P2 social                | Existing editable SVG/PNG                      | Inspect dimensions, add image metadata; retain shared card                 | Legible previews without asset bloat | Dimensions/alt and OG/Twitter tests                                        |
| P2 machine discovery     | Shipped capabilities/schema/templates          | Link source artifacts from docs                                            | Correct machine contract             | Links resolve to canonical repository artifacts                            |
| P2 measurement           | GA present, docs deny it                       | Reconcile docs and document Search Console process                         | Honest measurement baseline          | Before/after lab reports; manual deployment checklist                      |

Architecture reference: [TanStack SSR](https://tanstack.com/router/latest/docs/guide/ssr)
and [Vercel configuration](https://vercel.com/docs/project-configuration).
No user-agent detection, runtime SSR service or framework migration is needed.
