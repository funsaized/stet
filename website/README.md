# stetkit.com

The Stet product homepage, built with Vite, React, TypeScript, and TanStack Router.
The demonstrations use the published `@funsaized/stet@0.0.2` package, including its
React adapters. This is a standalone app: it does not change the library build or
require files outside `website/`.

## Development

Use Node.js 22.12+ and npm.

```sh
cd website
npm ci
npm run dev
```

The homepage is `/`, the interactive pencil case is `/playground`, and the
getting-started guide with framework examples is `/docs`. Fonts are bundled with
the app. There are no analytics, environment variables, external font requests,
or backend services. The launch form is an interactive local demonstration.

## Quality checks

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

| Setting           | Value                         |
| ----------------- | ----------------------------- |
| Root Directory    | `website`                     |
| Framework Preset  | Vite                          |
| Install Command   | `npm ci`                      |
| Build Command     | `npm run build`               |
| Output Directory  | `dist`                        |
| Node.js Version   | 22.x or a newer supported LTS |
| Production Branch | `master`                      |

`website/vercel.json` configures SPA route rewrites and immutable asset caching.
Direct `/docs` and `/playground` requests load the application, while asset requests retain normal
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
