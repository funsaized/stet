# stet

Hand-sketched margin marks on live UI. `stet` adds circles, underlines,
highlights, arrows, sticky notes, and right/wrong marks without replacing the
elements your app already owns.

```sh
npm install stet
```

```js
import { arrow, circle, highlight, mark, sticky, underline } from "stet";
import "stet/style.css";

const sketch = circle(document.querySelector("#email"), { stroke: "crimson" });
underline(document.querySelector("h1"));
highlight(document.querySelector("strong"));
arrow(document.querySelector("h1"), document.querySelector("#email"), {
  label: "start here",
});
sticky(document.querySelector("#email"), { text: "required", side: "right" });
mark(document.querySelector(".bad-example"), "wrong");

sketch.resketch(42);
sketch.destroy();
```

Every attacher returns `{ resketch(seed?), destroy() }`. A fixed seed produces
the same paths. Hover re-sketching is enabled by default and automatically
disabled when the user prefers reduced motion.

## Options

All primitives accept `seed`, `roughness`, `boil`, `stroke`, `fill`, `width`,
`resketchOnHover`, and `padding` where relevant. `boil` defaults to `0.3`; set
it to `0` for a static drawing. Sticky notes add `text` and `side`. Arrows add
`label`.

Theme globally or locally with CSS variables:

```css
:root {
  --stet-stroke: #b42318;
  --stet-fill: #ffe066;
  --stet-paper: #fff3bf;
  --stet-width: 2;
  --stet-correct: #2b8a3e;
  --stet-wrong: #c92a2a;
  --stet-note: #f08c00;
}
```

## Framework adapters

- React: components exported by `stet/react`
- Vue: directives exported by `stet/vue`
- Svelte: actions exported by `stet/svelte`
- Angular: standalone directives exported by `stet/angular`

See [`examples/`](examples/) for each framework. Adapters attach only after
mount, so server rendering remains safe.

## Browser support

The latest two Chrome, Firefox, Safari, and Edge releases. `ResizeObserver` is
required. Overlays track viewport resize and nested scrolling without changing
layout or intercepting pointer events.

## Development

```sh
npm install
npm test
npm run check
npm run size
```

MIT licensed.
