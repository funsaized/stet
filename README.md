# stet

Hand-sketched margin marks on live UI. Add circles, highlights, arrows, notes,
and proofreader marks without replacing your controls or layout.

Initial release: **0.0.1**. The API is under active development and may change
before 1.0. Pin an exact version if you need predictable upgrades.

Published on npm as `@funsaized/stet`.

![STET annotating a working release form with pen marks and a paper note](docs/visual/vanilla-after.png)

```sh
npm install @funsaized/stet
```

```js
import { circle } from "@funsaized/stet";
import "@funsaized/stet/style.css";

const save = document.querySelector("#save");
const annotation = circle(save);
```

The real `#save` element still owns focus, clicks, semantics, and layout.

```js
import { underline, highlight, arrow, sticky, mark } from "@funsaized/stet";

underline(heading);
highlight(phrase); // follows wrapped text, including paragraphs
arrow(source, destination, { label: "start here" });
sticky(save, { text: "Ready to ship." });
mark(answer, "right", { description: "Correct answer" });

annotation.refresh();  // follow a layout change, keep the same sketch
annotation.resketch(); // draw a new variation
annotation.destroy(); // remove the annotation and its subscriptions
```

Still by default. Seeded when you need repeatability. Optional hover resketching
and stroke boil honor reduced-motion preferences. No runtime dependencies.

To explore locally: `npm install`, then `python -m http.server 4173` and open
[the live demo](http://localhost:4173/examples/vanilla/) or
[the visual specimens](http://localhost:4173/examples/visual/).

## Documentation

- [Tutorial: annotate your first live interface](docs/tutorial.md)
- [Explanation: how stet marks live UI](docs/explanation.md)
- [API reference](docs/reference.md)
- [Framework examples](examples/)
- [GitHub Packages and release process](docs/releases.md)

Supports vanilla JavaScript, React, Vue, Svelte, and Angular. MIT licensed.
