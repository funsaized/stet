# PRD: stet v1

**Name:** stet
**Tagline:** leave this — hand-sketched margin marks on live UI
**Type:** Open-source annotation UI library
**Version:** 1.0
**Status:** Draft
**License (intended):** MIT
**Packages:** `stet`, `stet/react`, `stet/vue`, `stet/svelte`, `stet/angular`
**Site (intended):** stet.dev

---

## 1. Summary

**stet** draws hand-sketched annotation chrome onto existing DOM nodes: circles, underlines, arrows, sticky notes, and right/wrong marks.

Named for the proofreader’s mark: *stet* — “let it stand.” The page stays. The library only writes in the margin.

It is not a component library. Apps keep their own buttons, inputs, and layout.

v1 ships a vanilla JS + CSS core. React, Vue, Svelte, and Angular get thin wrappers that call the same core.

**Why this name.** *stet* is a margin annotation. Short, uncommon as a UI library, reads as a verb in code (`stet.circle(el)`). Avoid `marginalia` and `redpen` — both crowded.

**Name alternatives (rejected):** gutterink (clearer, duller), marginalia (taken), redpen (taken).

---

## 2. Problem

Docs, onboarding, marketing, and explainers need to *point at* UI. Today that means screenshots, GIFs, or heavyweight tour libraries.

Those options are static, inaccessible, or generic. There is no tiny, framework-agnostic way to mark up live UI like a teacher marked a page.

---

## 3. Goals

- Attach doodles to any element without replacing it.
- Fresh seeded sketch on mount; optional re-sketch on hover.
- Real nodes keep focus, clicks, forms, and screen-reader behavior.
- Vanilla-first. No framework required.
- Thin official adapters for React, Vue, Svelte, Angular.
- Tiny runtime. Zero required dependencies.
- Reduced-motion support.

## 4. Non-goals (v1)

- Full design system (buttons, inputs, themes, layout).
- Product tours / step wizards / tooltips as a system.
- Canvas or whiteboard editor.
- Web Components as the primary API.
- SolidJS, Lit, Qwik, or other extra wrappers.
- Visual builder / Figma plugin.
- Collision-perfect layout engine.

---

## 5. Users

| Who | Why |
|---|---|
| Docs / DX sites | Circle a prop, arrow to a control |
| Marketing / landing pages | Annotated product shots that stay live |
| Onboarding | Margin notes on real forms |
| Teachers / explainers | Right / wrong marks on examples |
| Side-project authors | Whimsical chrome without a design system |

---

## 6. Product

### 6.1 Primitives (v1)

| Primitive | Attaches to | Draws |
|---|---|---|
| `circle` | one element | rough ellipse around target |
| `underline` | one element | rough line under target |
| `highlight` | one element | marker wash behind text/box |
| `arrow` | two elements | sketched line + open head + optional label |
| `sticky` | one element | paper note at a side, with text |
| `mark` | one element | `right` check or `wrong` slash |

### 6.2 Behaviors

- New sketch from a seed on attach.
- `resketch()` / `resketch(seed)` redraws.
- Hover re-sketch on by default; can disable.
- Stroke “boil” via CSS keyframes, not rAF.
- Follow target with ResizeObserver + scroll/layout updates.
- `destroy()` removes SVG, listeners, observers.
- `prefers-reduced-motion`: freeze boil, skip hover re-sketch.

### 6.3 What the page looks like

A live form or docs snippet. A red circle around an input. An arrow from a heading to that input. A yellow sticky: “required”. A slash through a bad example. Feels like a marked printout.

---

## 7. API

### 7.1 Vanilla (source of truth)

```js
import { circle, underline, highlight, arrow, sticky, mark } from "stet";
import "stet/style.css";

const handle = circle(el, { seed, stroke, padding, boil: 0.3 });
handle.resketch();
handle.resketch(42);
handle.destroy();

underline(el, { stroke: "red" });
highlight(el);
arrow(fromEl, toEl, { label: "click this" });
sticky(el, { text: "required", side: "right" });
mark(el, "wrong"); // or "right"
```

Every attacher:

- Throws if the element is missing (`arrow` throws if either is missing).
- Returns `{ resketch(seed?), destroy() }`.
- Never hijacks native pointer events on the target.
- Sticky text is real DOM content when it carries meaning; decorative doodles are `aria-hidden`.

### 7.2 Options (shared where it applies)

| Option | Default | Purpose |
|---|---|---|
| `seed` | random | Deterministic sketch |
| `stroke` / `fill` / `width` | CSS vars | Per-call visual overrides |
| `roughness` | `1` | Base path wobble |
| `boil` | `0.3` | Frame jitter in px; `0` disables animation |
| `resketchOnHover` | `true` | New seed on hover |
| `padding` | primitive-specific | Gap around target |
| `side` | `auto` | sticky only: top/right/bottom/left |
| `label` / `text` | — | arrow label / sticky body |

`mark` takes its kind as the second argument: `mark(el, "right" | "wrong", options?)`.
The framework wrappers expose the same choice as a `kind` prop or directive/action option.

### 7.3 Framework wrappers

Same primitives. No extra features.

| Package path | Shape |
|---|---|
| `stet` | attachers |
| `stet/react` | components + refs |
| `stet/vue` | directives + optional components |
| `stet/svelte` | actions |
| `stet/angular` | standalone directives |

React sketch:

```jsx
<Circle target={ref} stroke="red" />
<Arrow from={a} to={b} label="starts here" />
<Sticky side="left">why this field exists</Sticky>
<Mark target={ref} kind="wrong" />
```

Svelte sketch:

```svelte
<button use:circle={{ stroke: "red" }}>Save</button>
```

Wrappers only:

1. Resolve element(s).
2. Call core attacher on mount.
3. Map prop changes to `resketch` / option updates.
4. Call `destroy` on unmount.

---

## 8. Technical requirements

- Zero runtime dependencies. Frameworks are optional peers.
- ESM + one stylesheet. Theme only via CSS custom properties.
- SVG overlay. `pointer-events: none` except sticky text.
- Seeded PRNG only. Same seed → same paths. No `Math.random()` outside `randomSeed()`.
- Boil is CSS, not JS. No `rAF`, no animation loops.
- Client-only attach. SSR no-ops until mount.
- No Shadow DOM in v1. No layout shift: size comes from the target, never the sketch.
- Bundle target: core JS ≤ ~6 KB gzip, CSS ≤ ~3 KB gzip.
- TypeScript types shipped.

### Browser support

Last two versions of Chrome, Firefox, Safari, Edge. Requires `ResizeObserver`. No IE.

---

## 8.5 Implementation

### Copy as-is

| Piece | Use for |
|---|---|
| `mulberry32` + `randomSeed()` | All jitter. Same seed, same sketch. |
| `rough.ts` generators | `roughEllipse`, `roughLine`, `roughArrow`, `roughCheckmark`, `scribbleFill`, `jitter`, `toPath` |
| 3-frame boil | Generate 3 path variants; swap with `step-end` keyframes on a 1200 ms cycle |
| Handle contract | `fn(el, opts) → { resketch(seed?), destroy() }` |
| `attachChrome` pattern | One mount helper: create SVG, paint layers, observe, bind hover, return handle |
| Layer model | `{ className, gen(w, h, opts) → path }` composed per primitive |
| Theming | CSS vars only (`--stet-stroke`, `--stet-fill`, `--stet-paper`, `--stet-width`, `--stet-correct`, `--stet-wrong`, `--stet-note`) |
| Reduced motion | Freeze `data-i="0"`, skip hover resketch |
| React wrapper style | Client-only, sketch opts as props, no logic in the wrapper |
| Definition of done | attacher + handle + tests + docs + example in the same change |
| Invariants | zero deps, fake chrome, determinism, no layout shift, prefer deleting |

### Do not copy

- Button / checkbox / input / select / card chrome
- `setState` loading machine
- Opt-in handwritten font
- “Library owns the control” wrappers
- React-only packaging — we add Vue/Svelte/Angular

### Suggested file map

```
src/prng.ts        # mulberry32, randomSeed
src/rough.ts       # geometry + boil frames
src/mount.ts       # createSvg, paint, attachChrome, lineBoxes, elementBox
src/primitives.ts  # circle, underline, highlight, arrow, sticky, mark
src/index.ts       # public attachers
style.css          # host/svg position, boil keyframes, tokens, reduced-motion
src/react.ts
src/vue.ts         # directives
src/svelte.ts      # actions
src/angular.ts     # standalone directives
tests/             # vitest: throw, seed determinism, destroy cleanup
examples/          # vanilla first, then one page per framework
```

New shapes go in `rough.ts` only if existing generators cannot compose. Sticky is the one new shape (rounded rect + fill + text node). Mark is `roughCheckmark` or two `roughLine`s.

### Mount + overlay

**Single-target primitives** (`circle`, `underline`, `highlight`, `mark`, `sticky`):

1. `position: relative` on host if needed.
2. `el.prepend(svg)` in the SVG namespace.
3. SVG absolutely covers the host box (`offsetWidth/Height`).
4. Inline/wrapping text uses `getClientRects()` → `lineBoxes()` so a multi-line phrase gets one doodle per line.
5. `ResizeObserver` on the host and its block ancestor. Disconnect in `destroy()`.

**Arrow** (hardest):

1. SVG on `document.body`, position `fixed` or `absolute` in viewport/document coords.
2. Endpoints = midpoints of `from`/`to` `getBoundingClientRect()`, inset by a gap so the head does not sit on the box edge.
3. Observe both anchors + `resize`. v1: document drift inside nested scrollers; document the limit (“drifts on scroll if inside a scrolling container”).
4. Optional label = HTML `<span>` near the path midpoint, not text baked only into SVG.

**Sticky:**

1. Same host attach as circle.
2. Paper rect is a rough rounded rect *outside* the target (`side: top|right|bottom|left|auto`).
3. `auto` = first side with space in the host’s client box; no full collision engine.
4. Text is a real DOM node so it can be read by AT. SVG remains `aria-hidden`.
5. Sticky paper may use `pointer-events: auto` on the text box only.

### Paint pipeline (per resketch)

1. Resolve seed (`opts.seed` or `randomSeed()`).
2. Measure box(es).
3. For each layer, `gen(w, h, { seed, roughness, boil })` → 3 path `d`s.
4. Write three `<path>`s (or `data-i="0|1|2"` frames). CSS cycles them.
5. Do not animate in JS.

Hover: `pointerenter` / `pointerdown` → `resketch()` unless reduced motion or `resketchOnHover: false`.

`destroy()`: disconnect RO, remove listeners, `svg.remove()`, drop host classes/data attrs.

### Options

| Option | Default | Notes |
|---|---|---|
| `seed` | random | Deterministic if set |
| `roughness` | `1` | Base wobble |
| `boil` | `0.3` | Frame jitter in px; `0` = static |
| `stroke` / `fill` / `width` | CSS vars | Per-call override |
| `resketchOnHover` | `true` | Off for reduced motion |
| `padding` | per primitive | Circle overshoot, underline gap |
| `side` | `auto` | sticky |
| `label` / `text` | — | arrow / sticky |

For vanilla, `mark` receives `"right" | "wrong"` as its second argument. Framework
adapters expose that value as `kind`; it is not part of the shared core options.

Path markup and class names are API. Consumers theme with vars, never by restyling paths.

### Framework adapters

Framework adapters contain **no geometry**.

```
mount → core attacher
prop/option change → resketch or option patch
unmount → destroy
```

| Framework | Idiom | SSR |
|---|---|---|
| React | `<Circle target={ref} />` or wrap children and attach to the root el | `'use client'` |
| Vue | `v-stet-circle="{ stroke: 'red' }"` | `onMounted` |
| Svelte | `use:circle={{ stroke: "red" }}` | browser-only action |
| Angular | `standalone` directive `[stetCircle]` | `afterNextRender` / `AfterViewInit` |

Angular: export `CUSTOM_ELEMENTS_SCHEMA` is unnecessary (no custom tags). Directives only.

### Tests

Per primitive:

- throws if element missing (arrow: either missing)
- fixed seed → identical `d` attributes
- `destroy()` removes SVG + listeners (no leftover RO)
- reduced-motion: single frame, no hover resketch

### Code style constraints

- Named constants; tuned values get a comment saying what they were tuned against.
- Comments record constraints, not narration.
- No speculative options.
- Keep the size claim honest after every primitive.
- Prefer compose-from-`rough.ts` over new generators.

---

## 9. Accessibility

- Target element remains the accessible control.
- Decorative SVG: `aria-hidden="true"`.
- Sticky / arrow label: real text in the DOM, not only painted in SVG.
- Do not steal focus or tab stops.
- Honor `prefers-reduced-motion`.
- Color is not the only mark: check vs slash have distinct shapes.

---

## 10. Packaging & repo

```
packages/core          # attachers, geometry, PRNG
packages/react
packages/vue
packages/svelte
packages/angular
style.css
examples/vanilla
examples/react
examples/vue
examples/svelte
examples/angular
```

v1 may start as a single package with export paths (`stet/react`) instead of a full monorepo if that ships faster. Public API must look the same.

Install:

```sh
npm i stet
```

---

## 11. Success criteria (v1 done)

- All six primitives work on live DOM in vanilla HTML.
- Hover re-sketch + seed + destroy work.
- Docs page built using only this library for annotations.
- React, Vue, Svelte, Angular each have one official example.
- Reduced-motion path verified.
- Types, MIT license, README, changelog.
- No required runtime deps.

---

## 12. Out of scope until later

Accordion tours, tabs, badges, cards, typed “steps”, Web Component tags, collision avoidance beyond simple `side: auto`, annotation persistence, collaborative markup, drawing tools for end users.

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| Overlays drift on transform/scroll containers | Observe target + offset parent; document containing-block limits |
| Framework wrappers drift from core | Wrappers stay < ~50 lines; no logic there |
| Looks like a gimmick | Ship docs/onboarding examples, not just buttons |
| Scope creep into a UI kit | Reject any primitive that replaces a native control |

---

## 14. v1 milestones

1. **Core geometry** — seeded rough ellipse, line, arrow, slash, check, wash.
2. **Attachers** — six primitives + handle contract + CSS boil.
3. **Tracking** — resize/layout follow + destroy.
4. **Vanilla example site** — the product demo.
5. **Wrappers** — React, then Svelte actions, Vue directives, Angular directives.
6. **A11y + reduced motion + types + npm.**
