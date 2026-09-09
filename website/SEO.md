# Website SEO

This is the maintainer guide for search indexing and measurement. For local setup,
builds, deployment settings and rendering architecture, see [website README](README.md).

## What to maintain

- **Public routes and metadata:** `src/seo.ts` generates route registration, titles,
  descriptions, canonical URLs, breadcrumbs, structured data and sitemap entries.
- **Use-case content:** `src/showcase/scenarios.ts` supplies scenario routes and copy.
- **Framework guides:** `src/frameworks.ts` supplies guide routes and copy; examples
  come directly from the generated `agent/templates` files.
- **Canonical host:** `https://www.stetkit.com`. Keep apex → www redirects in Vercel.
- **Static output:** build generates each page, `sitemap.xml`, `robots.txt` and a
  noindex `404.html`. Do not restore a catch-all SPA rewrite.

The existing homepage, framework guides and live use cases are the search
landing pages. Keep their copy specific to what the library actually does.
Stet annotates findings; it does not perform QA or run a collaboration backend.
Avoid duplicate articles or framework × primitive pages that add no useful detail.

## Search Console setup

1. In [Google Search Console](https://search.google.com/search-console), add a
   **Domain property** for `stetkit.com` (no protocol or www).
2. Add Google's supplied TXT record at the DNS provider and verify ownership.
   Keep the record. No verification token belongs in source for this method.
3. After deployment, submit `https://www.stetkit.com/sitemap.xml`.
4. Use URL Inspection on the homepage, `/docs`, `/docs/react`, `/agent-workflow`
   and important use cases. Test the live URL and request indexing after major changes.
5. Check that Google's selected canonical uses www. Monitor Page indexing for
   duplicates and soft 404s, Performance for queries/pages, and Core Web Vitals.

A Domain property covers both hosts; the canonical site still uses www.
See Google's [property setup](https://support.google.com/webmasters/answer/34592)
and [ownership verification](https://support.google.com/webmasters/answer/9008080)
instructions. Bing Webmaster Tools can use the same sitemap.

## Deployment checks

Confirm HTTPS and apex → www redirects, trailing-slash normalization, and deep
links. Known routes must return their own HTML before JavaScript runs; a random
missing path must return HTTP 404. Check robots and sitemap at the canonical host.
Local tests cannot verify Vercel account-level redirects or DNS.

Use [Rich Results Test](https://search.google.com/test/rich-results) or the
[Schema.org validator](https://validator.schema.org/) to inspect the homepage's
WebSite/SoftwareApplication data and inner-page breadcrumbs. Do not add invented
ratings to satisfy a rich-result requirement.

Set the GitHub repository homepage to `https://www.stetkit.com`; relevant topics
include `ui-annotation`, `javascript`, `typescript`, the supported frameworks,
`hand-drawn`, `developer-tools` and `coding-agents`.

## Checks and measurements

From `website/`, with root and website dependencies installed:

```sh
npm run check       # Includes static HTML, metadata, sitemap and link assertions
npm run test:e2e    # Includes HTTP, no-JavaScript, hydration and accessibility checks
npm run preview -- --port 4175
```

With the preview running, in a second terminal also in `website/`:

```sh
node scripts/audit.mjs
CHROME_PATH=/usr/bin/chromium npx lighthouse@13.4.1 http://127.0.0.1:4175/docs --chrome-flags='--headless --no-sandbox' --output=json --output-path=reports/seo/docs.lighthouse.json
```

The audit records page text, metadata and responses with and without JavaScript.
Lighthouse records lab performance and accessibility checks. These generated files
live under ignored `reports/`; retain them locally or as CI artifacts. They are
measurement output, not documentation to keep updating by hand. The audit creates
its output directory and also accepts an origin and output path as arguments.

GA measurement ID `G-NECYZ55K84` loads asynchronously. On the canonical production
origin, successful install copies emit `copy_install`; framework choices emit
`select_framework`. No copied code or form values are sent. Verify events and SPA
page views in GA, avoiding duplicate page-view configuration. Use real query and
conversion data to guide future content changes.

## September 9, 2026 baseline

This is a historical measurement, not a claim about the current deployment.
Before crawl data came from production; after data came from the local static build.
Production redirected apex → www while canonical tags pointed back to apex, and
unknown paths returned the same empty application shell with HTTP 200.

| Metric                                      | Before          | After            |
| ------------------------------------------- | --------------- | ---------------- |
| Routes with useful static HTML              | 0 / 11          | 16 / 16          |
| Distinct titles and descriptions            | 1 / 11          | 16 / 16          |
| Correct route and preferred-host canonicals | 0 / 11          | 16 / 16          |
| Unknown path returns HTTP 404               | No              | Yes, local build |
| Lighthouse Performance: home / docs         | 90 / 97         | 95 / 97          |
| Lighthouse SEO: home / docs                 | 100 / 100       | 100 / 100        |
| LCP: home / docs                            | 2.37 s / 1.95 s | 2.40 s / 2.10 s  |
| CLS: home / docs                            | 0 / 0.0099      | 0 / 0            |
| Own initial JavaScript, decoded             | 417 KB          | About 341 KB     |

Lighthouse 13.4.1 used one simulated-mobile run per page, localhost with gzip and
GA enabled. These are lab observations, not ranking gains or field Core Web Vitals.
LCP did not improve; INP was not measured. Accessibility and Best Practices scored
100 on both pages before and after.

At that point, unit, agent, template, package, demo and static SEO checks passed;
the dedicated SEO browser suite passed all 16 checks. **Screenshot gates were not
all green:** six website comparisons and one root Firefox comparison failed.
Four of the six website comparisons also failed against the unchanged build on
the same machine. The two additional mobile comparisons require review on the
Ubuntu 24.04 baseline runner. No baseline images or thresholds were overwritten.
Use current CI results to determine whether these failures remain.

The [original audit, research, full metrics and test logs](https://github.com/funsaized/stet/tree/19e1e0a/website/reports/seo)
remain available in Git history. They were consolidated here to keep one useful
maintainer guide instead of a collection of dated reports.
