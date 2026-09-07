# stetkit.com

The Stet product homepage, built with Vite, React, TypeScript, and TanStack Router.
The demonstrations use **this checkout's actual runtime** through Vite aliases and
TypeScript paths, with React deduplication. Canonical capability JSON and framework
templates come directly from `../agent/`; the browser does not import CLI or
validation code. This app now requires the repository checkout, rather than an
isolated copy of `website/`. Root and website dependencies must both be installed.
The published dependency remains pinned to 0.1.0 for release identity; aliases
intentionally exercise upcoming runtime changes before they ship.

## Development

Use Node.js 22.12+ and npm.

```sh
npm ci
npm --prefix website ci
npm --prefix website run dev
```

Start at `/use-cases`. Direct links are:

- `/use-cases/workspace-deletion`: Explain, Product, UX, Engineering and QE views.
- `/use-cases/security-handoff`: three implemented local security controls.
- `/use-cases/form-review`: compare buggy and fixed focus handling, with the fix annotated in green.
- `/use-cases/feature-showcase`: feature composition over a release form.
- `/use-cases/guided-tutorial`: a dedicated deployment form with branch and environment choices.
- `/use-cases/live-documentation`: a working activity inbox with filters, expandable details and read state.
- `/agent-workflow`: deterministic walkthrough of the shipped authoring pipeline.
- `/playground`: actual primitive options, nudges, seed, reset and copy.
- `/docs`: integration instructions and canonical framework examples.

The homepage is `/`. Fonts are bundled with
the app. There are no analytics, environment variables, external font requests,
or backend services. The launch form is an interactive local demonstration.

## Quality checks

Run these commands inside `website/` after installing both sets of dependencies.

```sh
npm run lint          # Oxlint: correctness, React hooks, and accessibility rules
npm run lint:fix      # Apply safe lint fixes
npm run format       # Format with Oxfmt
npm run format:check # Check formatting without changing files
npm run check        # Lint, formatting, TypeScript, and production build
npx playwright install chromium
npm run test:e2e     # Build and test the production site
```

Browser checks cover desktop and mobile interactions, every annotation primitive,
framework snippets, clipboard operations, route cleanup, direct documentation
loads, keyboard tabs, reduced motion, overflow, and automated WCAG AA audits.
Sketchbook tests also cover regeneration, palette changes, fixed list and page length,
retained control state, pause controls, and reaching the footer.
Automated accessibility checks supplement manual keyboard and visual inspection;
they are not a complete accessibility certification.

## Vercel

Import `funsaized/stet` into Vercel and configure:

| Setting           | Value                                              |
| ----------------- | -------------------------------------------------- |
| Root Directory    | `website`                                          |
| Framework Preset  | Vite                                               |
| Install Command   | `npm --prefix .. ci --ignore-scripts && npm ci`    |
| Build Command     | `npm --prefix .. run agent:check && npm run build` |
| Output Directory  | `dist`                                             |
| Node.js Version   | 22.x or a newer supported LTS                      |
| Production Branch | `master`                                           |

Enable **Include source files outside of the Root Directory in the Build Step**
in Vercel's project settings, as described in the
[Vercel monorepo documentation](https://vercel.com/docs/monorepos/monorepo-faq).
This is needed for the checkout runtime and canonical agent assets.

`website/vercel.json` configures SPA route rewrites and immutable asset caching.
Direct `/docs`, `/playground`, `/agent-workflow` and `/use-cases/<scenario>` requests load the application, while asset requests retain normal
404 behavior. No environment variables are needed.

Add `stetkit.com` in the Vercel project's domain settings, then apply the DNS
records Vercel supplies. Optionally add `www.stetkit.com` and redirect it to the
apex domain. Canonical URLs, the sitemap, and social metadata use `stetkit.com`.
This repository configuration does not itself create a Vercel project or change DNS.

## Structure

- `src/pages/`: homepage and documentation.
- `src/components/`: live examples, controls, code blocks, and shared layout.
- `src/constants.ts`: package metadata and annotation descriptions.
- `src/styles.css`: responsive paper-and-ink design, transitions, motion preferences.
- `public/`: favicon, social artwork, robots, and sitemap.
- `tests/`: production-browser checks.

The social card's editable source is `public/social.svg`. To regenerate the PNG
after changing it, install Playwright Chromium and run `npm run social`.

When releasing a new Stet version, update the exact dependency and lockfile,
installation constant, version labels, snippets where needed, and documentation.
Run the complete checks before shipping.

## Fixed sketchbook

The homepage combines benefits and installation into one section, followed by a
fixed collection of 12 distinct interactive examples. Each visit creates a random
seed and palette. **Shuffle everything** explicitly replaces the collection and
changes its arrangement, ink geometry, boil variation, and colors.

All 12 cards stay mounted. Scrolling never adds, removes, reorders, or replaces
cards, and their control state persists as visitors move away and return. The
responsive CSS grid has a fixed row height; the footer follows the final row.
IntersectionObserver only triggers each card's one-time entrance animation.
Stet handles refresh during that 650ms entrance, then track scrolling normally.

Six new examples appear in every edition: a plant to water, a fortune to open,
mood faces, star ratings, an imaginary record player, and a progress card.
They are mixed with six other examples chosen without duplicates.
The record player is an explicitly imaginary interaction and plays no audio.

**Pause ink** stops boil and future entrance motion; reduced-motion preferences
apply automatically. **To the bottom** is a normal anchor to the collection's end.
There is no loading trigger, endless mode, or add-more control.

## Showcase contracts and verification

`src/showcase/scenarios.ts` owns demo-only intent, perspective and plan metadata.
Fixtures mount explicit React adapters with shared option objects. Plans are never
interpreted at runtime. The source panel imports those exact component files as
text. The Frameworks panel reads generated canonical templates, not another API
catalog. `tests/agent/showcase.test.ts` validates every bundled plan and its source
refs; existing template checks compile examples for all five frameworks.

`tests/showcase.spec.ts` covers annotation toggles, live controls, unchanged fixture
size, distinct viewpoint surfaces and tutorial state preservation, conditional findings,
canonical code inspection, mobile overflow, automated accessibility and fixed-seed
viewport screenshots. Screenshots include body overlays. Run without
`--update-snapshots` to check reviewed baselines. After an intentional visual change,
inspect desktop/mobile images before accepting replacements.

CI installs both dependency sets, checks generated drift, validates plans, compiles
canonical templates, builds the static site and runs browser checks. It uploads
`website/dist` as an ordinary static artifact. Existing Vercel rewrites support
deep links without a backend. No hosting project or production deployment is
created by these configuration files.

The playground's pixel nudges are unreleased checkout features; published 0.1.0
users should query their installed capabilities and omit these options. Use-case
plans use existing 0.1.0 primitives/options.

Website screenshot baselines use the Ubuntu 24.04 CI runner and the lockfile-pinned
Playwright browser. Other Linux distributions can render text differently even
with bundled fonts. When updating baselines, review the CI actual/diff images in
`website-test-results` and verify the updated images in CI; do not loosen the pixel
threshold to accommodate an unreviewed difference.
