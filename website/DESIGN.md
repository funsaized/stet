# A little ink, a lot of personality

## Reference analysis

Reference: [Drawably](https://www.drawably.dev/), inspected in a live browser at
desktop size on September 6, 2026.

Drawably opens with a centered handwritten wordmark and a short product promise.
Its primary content is an arrangement of working controls: buttons, inputs,
checkboxes, radio controls, a toggle, a select, and a note. Blue sketched borders
unify the presentation. The page uses very little conventional marketing copy,
large spaces between sections, and a restrained paper-colored background.

The next section makes installation easy with a compact shell command, copy
control, release/license labels, and a React snippet. A lower-level JavaScript
example and a grid of function signatures complete the page. Navigation is sparse.
The controls themselves explain the product more effectively than static images.

## Stet's interpretation

Stet annotates existing UI. The homepage therefore presents familiar, clean
controls with handwritten marks layered over them. It uses an original editorial
layout: warm paper, dark olive text, red proofreading ink, restrained serif
headlines, and handwritten margin notes. No Drawably assets or source were copied.

1. **Identity and live hero.** A large left-aligned promise sits beside an editable
   launch checklist. Actual Stet underlines, highlights, circles, and sticky notes
   demonstrate the library. The annotations switch makes the additive behavior
   visible. Submitting triggers a local success state and a brief confetti effect.
2. **Framework strip.** Five entry points are visible without interrupting the
   product demonstration: React, Vue, Svelte, Angular, and vanilla JavaScript.
3. **Benefits and installation.** One combined section pairs the installation
   command with four practical principles: preserving native controls, keeping
   dependencies small, tracking geometry, and respecting motion preferences.
   Language usage examples stay in the documentation.
4. **An endless sketchbook.** Scrolling reveals loose compositions of real
   controls, notes, quotations, permission slips, and annotated ideas. A seeded
   generator varies type, width, offset, rotation, palette, sketch geometry, and
   boil strength. Shuffle changes the entire edition without moving the reader.
   Rows use invisible placement slots to prevent unusable collisions; varied
   silhouettes and offsets keep the composition irregular. Only nearby rows
   remain mounted. A sticky toolbar provides shuffle, pause, and footer access.
5. **A dedicated pencil case.** `/playground` contains all six annotation tools,
   live option controls, and their matching code. It is linked from the main
   navigation, hero CTA, and documentation.
6. **Documentation and closing.** `/docs` contains complete framework examples
   and API guidance. The closing proofreader's definition of “stet” and footer
   remain reachable through the sketchbook's end control.

## Interaction and accessibility

- The native demo controls keep their click and keyboard behavior.
- Stet marks use the published package rather than imitations in CSS.
- Motion consists of a short opacity entrance, button transitions, optional ink
  boil, finite sketchbook entrances, a slowly turning asterisk, and a one-shot launch celebration.
- Reduced-motion preferences disable decorative animation and smooth scrolling;
  the library independently honors the same preference.
- Primitive tabs support arrow keys, Home, and End. Switches expose checked state.
- Copy actions announce success or failure. Launch status has a named live output.
- Small text uses colors checked against the actual paper surfaces.
- Mobile layouts stack the hero and playground controls; code panes scroll
  horizontally inside their containers rather than widening the page.
- The hero uses opacity-only entrances. Sketchbook entrances refresh the attached
  handles during their finite motion, then let the library track resize and scroll.

## Stack

Vite builds a static React app; TanStack Router provides home/playground/docs navigation,
scroll restoration, and a not-found view. The published Stet version is pinned.
Fonts are served locally. Vercel serves the static build with an SPA fallback.

Implementation references:
[TanStack Router quick start](https://tanstack.com/router/latest/docs/quick-start),
[Vite static deployment](https://vite.dev/guide/static-deploy.html),
[Oxlint configuration](https://oxc.rs/docs/guide/usage/linter/config), and
[Oxfmt](https://oxc.rs/docs/guide/usage/formatter).
