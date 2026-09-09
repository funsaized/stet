# Stet SEO implementation report

Audit date: September 9, 2026. Changes are local source/build changes, **not a
production deployment**. The implementation keeps React, Vite, TanStack Router,
the original visual identity, interactive fixtures and the annotation runtime.

## What changed

Every one of the **16 indexable routes now has useful static HTML**, including its
own title, description, canonical, social metadata, H1 and explanatory content.
Five are new framework guides. The build emits each route as a clean-URL HTML file;
the browser loads the matching lazy component and hydrates the same tree. Annotation
effects mount only in the browser. No crawler detection or alternate crawler page
exists. The sketchbook uses a stable initial edition and restores per-visit variety
after hydration without changing grid dimensions.

`src/seo.ts` is the route/SEO source. It derives scenarios from the existing scenario
catalog and framework routes from their guide definitions. Router registration,
prerender enumeration, titles, descriptions, canonicals, OG/Twitter values,
breadcrumbs, JSON-LD, sitemap generation and regression tests use that source.
Page components are lazy; Vite's manifest supplies active-route CSS/module preloads.
The regular bundled body font is preloaded. No new runtime dependency was added.

The homepage still says “A little ink. A lot of clarity.” Its nearby visible prose
now identifies a UI annotation library. Every use case has its own H1 and problem
introduction, retains the working interface and implementation artifacts, and links
to relevant docs, the agent workflow and related scenarios. `/use-cases` now has
its own canonical instead of borrowing workspace deletion's canonical.

New routes:

- `/docs/react`: DOM refs, null-rendering components, effect dependencies and cleanup.
- `/docs/vue`: directive binding and post-render reactive target cleanup.
- `/docs/svelte`: element actions, Svelte 5 effects and keyed destinations.
- `/docs/angular`: standalone directives, global styles, signal inputs and after-render effects.
- `/docs/javascript`: resolved Elements, refresh, destroy and option reattachment.

Each guide imports first-mark and lifecycle code directly from generated canonical
templates. They explain the distinction between published 0.1.0 and unreleased
placement nudges in checkout templates. They include styling, accessibility, limits,
use cases, agent setup and machine-readable contract links. No independently
maintained API implementation was created.

## Production redirects and canonical decision

**Preferred origin: https://www.stetkit.com.** Actual production behavior determined
this choice; there is no attempt to reverse an existing domain redirect from code.

| Requested production URL                                      | Observed chain before changes            |
| ------------------------------------------------------------- | ---------------------------------------- |
| `http://stetkit.com/`                                         | 308 → HTTPS apex → 308 → HTTPS www → 200 |
| `https://stetkit.com/`                                        | 308 → HTTPS www → 200                    |
| `http://www.stetkit.com/`                                     | 308 → HTTPS www → 200                    |
| `https://www.stetkit.com/`                                    | 200                                      |
| `https://www.stetkit.com/docs/`                               | 200; no trailing-slash normalization     |
| `https://www.stetkit.com/this-page-absolutely-does-not-exist` | 200; same 1,686-byte shell               |

Production responses included Vercel, HSTS, `nosniff`, a strict-origin referrer
policy and revalidation caching. No blocking robots policy was observed. Production
robots and sitemap both referenced the apex, as did raw canonical/OG tags. Rendered
canonicals also referenced the apex; `/use-cases` additionally referenced a different
scenario. This created contradictory host signals even after JavaScript ran.

The source now consistently uses www in metadata, sitemap/robots, JSON-LD, README,
package homepage, examples and documentation links. Vercel configuration retains
immutable hashed-asset caching, declares apex → www, enables clean URLs, removes
trailing slashes and redirects `/index` to `/`. The catch-all SPA rewrite is gone.
A generated `404.html` has noindex and no canonical; missing routes and assets return
HTTP 404 in the production-style local server. Vercel's native static handling is
configured for the same behavior. Verify that behavior at the edge after deployment;
local tests cannot verify account-level redirects or DNS.

## Search intent and content decisions

See [the initial audit, research sources and prioritized backlog](plan.md).
Search sampling was qualitative; no search-volume or ranking claims were invented.
Broad “annotation” results mix text annotation, image markup, tours and component
libraries. Stet's clearest answer is an installable library that marks live DOM
controls, with explicit framework lifecycle support and agent authoring artifacts.
This is an inference from the sampled results, not measured demand.

| Searcher query/intent                        | Best Stet destination after this change | Why it answers the intent                                                |
| -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| UI annotation library                        | `/`                                     | Immediate category, actual live demo, package and framework support      |
| React UI annotation library                  | `/docs/react`                           | Install, React refs/components, cleanup and source examples              |
| Vue / Svelte / Angular annotations           | Corresponding framework guide           | Native adapter and lifecycle details, not a framework-name substitution  |
| Hand-drawn annotations JavaScript            | `/docs/javascript`                      | Core DOM API, six primitives, refresh/destroy behavior                   |
| Coding-agent UI annotations / visual handoff | `/agent-workflow`                       | Actual inspect → plan → validate → implement → verify → handoff flow     |
| Coding-agent UI review / form QA annotations | `/use-cases/form-review`                | Reproducible focus defect and fix; Stet visualizes findings, not testing |
| Annotate live UI documentation               | `/use-cases/live-documentation`         | Working filters, details and read state; implementation source           |
| Product demo annotations                     | `/use-cases/feature-showcase`           | Three annotated features in a usable release form                        |
| Guided UI tutorial                           | `/use-cases/guided-tutorial`            | Application-owned progression with persistent control state              |

Rejected/deferred: duplicate category, QA or live-doc articles; a framework × primitive
page matrix; generic AI blog posts; screenshot-editor or replacement-component
positioning; unsupported comparisons. Existing destinations answer these intents.
`llms.txt` was not added. Capabilities, schema, template and Agent Skills links offer
concrete machine discovery without claiming a ranking benefit.

## Structured data and sharing

The homepage emits `WebSite` and `SoftwareApplication`, with the truthful
`DeveloperApplication` category, MIT license, npm download link and a zero-price
`Offer`. Inner pages emit `BreadcrumbList` matching visible navigation. No ratings,
reviews, FAQs or Q&A markup was invented. Local tests validate parseability, types,
identity/offer fields, breadcrumb positions and canonical URLs. This does not
promise rich-result eligibility; SoftwareApplication rich results can have further
requirements that Stet should not fabricate.

The existing 1200 × 630 PNG/SVG card was inspected and retained. It is legible and
recognizably Stet; metadata now includes dimensions, descriptive alt text and
route-specific Twitter/OG titles and descriptions. No per-route image farm was added.

## Measurement and analytics

Google Analytics `G-NECYZ55K84` was already enabled in source and production. It loads
asynchronously; the README's “no analytics” statement was incorrect and is repaired.
The library itself remains free of analytics. Successful installation copies now
emit `copy_install`; framework-tab changes emit `select_framework` with only the
framework name, only on the canonical production origin. No clipboard code or form
values are sent. No new analytics SDK or blocking script was added.

The measured GA script transfers about 174 KB compressed in these lab runs, larger
than the site's own compressed JavaScript on representative routes. It remains a
material third-party cost. Use GA property settings to review retention and SPA
page-view tracking; verify events in DebugView after deployment. Consider marking
`copy_install` as a key event. Docs, agent setup and GitHub visits can be evaluated
from page views/outbound-click settings without another runtime integration.

## Results

| Metric                                            | Before              | After (built artifact)                             |
| ------------------------------------------------- | ------------------- | -------------------------------------------------- |
| Routes with meaningful static content             | 0 / 11              | 16 / 16                                            |
| Distinct initial HTML titles                      | 1 / 11 (shared)     | 16 / 16                                            |
| Distinct initial descriptions                     | 1 / 11 (shared)     | 16 / 16                                            |
| Correct preferred-host, route-specific canonicals | 0 / 11              | 16 / 16                                            |
| Public paths listed in sitemap                    | 11 / 11, wrong host | 16 / 16, canonical host                            |
| Routes with initial H1                            | 0 / 11              | 16 / 16, unique                                    |
| Real HTTP 404 for unknown path                    | No (200)            | Yes, local static host; edge verification pending  |
| Structured data                                   | None                | WebSite + SoftwareApplication; 15 breadcrumb lists |
| Lighthouse SEO, home / docs                       | 100 / 100           | 100 / 100                                          |
| Lighthouse Performance, home / docs               | 90 / 97             | 95 / 97                                            |
| Lighthouse Accessibility, home / docs             | 100 / 100           | 100 / 100                                          |
| Lighthouse Best Practices, home / docs            | 100 / 100           | 100 / 100                                          |
| LCP, home / docs                                  | 2.37 s / 1.95 s     | 2.40 s / 2.10 s                                    |
| CLS, home / docs                                  | 0 / 0.0099          | 0 / 0                                              |
| TBT, home / docs                                  | 256 ms / 66 ms      | 48 ms / 69 ms                                      |
| Own initial JS decoded, home / docs               | 417.3 KB / 417.3 KB | 341.3 KB / 341.2 KB                                |
| Own initial JS transfer, home / docs              | 123.5 KB / 123.5 KB | 113.5 KB / 108.3 KB                                |

KB are decimal, JS excludes Google Analytics and includes all requested first-party
script chunks, not just the entry file. Transfer figures include HTTP overhead.
LCP did not improve in these runs; the main gains are crawlable content, reduced
JavaScript and homepage blocking time. No ranking or field-performance improvement
is claimed. Before titles/descriptions count distinct values, not pages with an
exclusive title. Canonical correctness checks both host and route identity.

Before crawl data is from actual production. After crawl data is from the built
local artifact, not an already deployed site. Lighthouse uses Chromium and
Lighthouse 13.4.1, default simulated mobile throttling, one run per route/stage,
GA enabled in both, localhost HTTP/1.1 and gzip. Vercel's HTTP/2/CDN behavior and real
user devices will differ. A preliminary after run exposed missing compression in
the custom preview; the server was corrected before the recorded final comparison.
Single-run score changes are directional, not statistically established gains.

INP is not available from these page-load audits. TBT is a lab responsiveness
signal, not an INP substitute or a field Core Web Vital. No CrUX/Search Console
ownership data was available. Animation and local lab LCP candidate selection also
limit how far the homepage LCP number can be generalized.

## Verification and remaining failures

- Root unit tests: 99 passed. Agent tests: 60 passed.
- Root check/build: passed, including generated-artifact drift.
- Framework templates: all 35 examples/patterns compile, including Vue/Svelte/Angular.
- Package consumer: passed, zero browser runtime dependencies.
- Demo suite: 20 passed in Chromium/Firefox.
- Website check: passed (lint, format, TypeScript, browser/SSR builds, static SEO assertions).
- Website full browser suite: **82 passed, six visual snapshot comparisons failed**.
- Root browser suite: **27 passed, one Firefox visual snapshot comparison failed**.
- Dedicated SEO suite: 16 passed across desktop and mobile.

The six website failures are desktop/mobile snapshots of workspace deletion,
security handoff and form review. The unchanged pre-change build was tested on the
same machine: four of those six comparisons already fail. Visual inspection shows
text rasterization/subpixel placement differences, not missing controls or overlays;
the two additional mobile mismatches still need review in the Ubuntu 24.04 CI
baseline environment. The root runtime source was not modified. Browser test
thresholds and reviewed baseline images were **not** loosened or overwritten.
This report therefore does not claim all quality gates are green. Docker's daemon
was unavailable without administrator authentication, so equivalent-container
verification was not possible in this session.

New automated checks cover every indexable built route, unique titles/descriptions
and H1s, meaningful main content, canonical/social values, no accidental noindex,
JSON-LD structure, exact sitemap equality, homepage reachability, internal route
integrity, image dimensions, preferred-host configuration, true HTTP 404s, URL
aliases, five representative no-JavaScript pages, all-route hydration/navigation,
and accessibility/overflow on all framework guides. Build invokes static assertions,
so existing website CI already runs them without an additional service.

Evidence:
[production crawl](before-production.json), [built crawl](after-local.json),
[quality-gate summary](quality-gates.json), [website test log](website-tests.txt),
[unchanged snapshot comparison](baseline-screenshots.txt),
[library browser log](library-browser.txt),
[before homepage Lighthouse](before-home.lighthouse.json),
[after homepage Lighthouse](after-home.lighthouse.json),
[before docs Lighthouse](before-docs.lighthouse.json),
[after docs Lighthouse](after-docs.lighthouse.json).
Embedded screenshot payloads are omitted from Lighthouse JSON; audit results and
settings are retained.

## Deployment and maintainer checklist

1. Run website CI on its Ubuntu 24.04 baseline runner. Review the six website image
   comparisons and existing Firefox baseline failure there before changing any snapshots.
2. Deploy the built `website/dist` with the committed Vercel settings. Do not restore
   the blanket rewrite. Keep the root checkout available during build.
3. Confirm both domains are attached, HTTPS www is primary, and apex redirects to www.
   Test HTTP, HTTPS, `/docs/`, `/docs.html`, `/index`, query strings and deep links.
4. Verify every public URL serves its own HTML with JavaScript disabled; verify a
   random missing URL and an unknown scenario return 404, not 200. Check robots and
   sitemap at `https://www.stetkit.com/robots.txt` and `/sitemap.xml`.
5. Set the GitHub repository homepage to `https://www.stetkit.com`. Suggested relevant
   topics: `ui-annotation`, `javascript`, `typescript`, `react`, `vue`, `svelte`,
   `angular`, `hand-drawn`, `developer-tools`, `coding-agents`.
6. Create a Google Search Console **Domain property for stetkit.com** and verify via
   the supplied DNS record. No invented verification token is in source.
7. Submit `https://www.stetkit.com/sitemap.xml`.
8. Inspect homepage, `/docs`, framework guides, agent workflow and important use cases
   using URL Inspection. Confirm Google's selected canonical agrees with www.
9. Request indexing after the rendering deployment; validate JSON-LD with
   [Rich Results Test](https://search.google.com/test/rich-results) and the
   [Schema.org validator](https://validator.schema.org/). Absence of a rich result
   is not a reason to invent ratings or extra schema.
10. Monitor Pages/Indexing for soft 404s, duplicates and canonical disagreements.
11. Monitor Performance queries/pages for the intent clusters above, and track
    organic arrivals through installation copies/docs visits. Revisit titles based
    on real impressions and click-through evidence, not arbitrary character targets.
12. Monitor Core Web Vitals once field data accumulates. Compare LCP/CLS/INP by page
    group, including long interactive visits and font loading.
13. Verify GA events and SPA page views after deployment, avoiding duplicate page-view
    configuration. Review privacy wording/property retention with the maintainer.
14. Optionally verify Bing Webmaster Tools and submit the same canonical sitemap.

No GitHub settings, DNS, Search Console ownership, production deployment or npm
publication was performed by these source changes.

## Reproduce

From the repository root, install both lockfiles and run the root quality commands
listed in package.json. From `website/`:

```sh
npm run check
npm run test:e2e
npm run preview -- --port 4175
# In a second terminal, also in website/:
node scripts/audit.mjs http://127.0.0.1:4175 reports/seo/after-local.json
CHROME_PATH=/usr/bin/chromium npx lighthouse@13.4.1 http://127.0.0.1:4175/docs --chrome-flags='--headless --no-sandbox' --output=json --output-path=reports/seo/after-docs.lighthouse.json
```

After deployment, the read-only audit script can instead target
`https://www.stetkit.com` and a fresh report filename. It enumerates URLs from the
built route manifest. Do not run the root demo suite and website preview together:
both currently use port 4175.
