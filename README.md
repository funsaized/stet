# stet

Hand-sketched margin marks on live UI. Add circles, highlights, arrows, notes,
and proofreader marks without replacing your controls or layout.

With `stet` installed, drop this into your client code:

```js
import { circle, sticky } from "stet";
import "stet/style.css";

const save = document.querySelector("#save");
circle(save, { stroke: "crimson" });
sticky(save, { text: "ship this", side: "right" });
```

The real `#save` element still owns focus, clicks, semantics, and layout.

## Documentation

- [Tutorial: annotate your first live interface](docs/tutorial.md)
- [Explanation: how stet marks live UI](docs/explanation.md)
- [API reference](docs/reference.md)
- [Framework examples](examples/)

Supports vanilla JavaScript, React, Vue, Svelte, and Angular. MIT licensed.
