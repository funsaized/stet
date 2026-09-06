# Annotate your first live interface

This tutorial adds hand-drawn marks to a working form. You will circle a real
input, attach a note, and redraw the sketch on demand.

You need Node.js, npm, and a local checkout of this repository. No framework
knowledge is required.

## 1. Pack the library

From the `stet` checkout, install dependencies and create a local package:

```sh
npm install
npm pack
```

The command prints an archive name containing the current package version,
for example `funsaized-stet-0.1.0.tgz`. Use the actual printed filename below.
Keep this terminal in the repository root.

## 2. Create a small browser app

In the parent directory, create a vanilla Vite project and install the package:

```sh
cd ..
npm create vite@latest stet-demo -- --template vanilla
cd stet-demo
npm install
npm install ../stet/funsaized-stet-0.1.0.tgz # use the filename printed by npm pack
```

Replace `index.html` with this form:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>stet tutorial</title>
  </head>
  <body>
    <main>
      <h1>Create an account</h1>
      <label for="email">Email</label>
      <input id="email" type="email" required />
      <button id="redraw" type="button">Draw it again</button>
    </main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

The input remains an ordinary required email field. `stet` will decorate it,
not replace it.

## 3. Circle the input

Replace `src/main.js` with:

```js
import { circle } from "@funsaized/stet";
import "@funsaized/stet/style.css";

const email = document.querySelector("#email");
circle(email, { stroke: "crimson" });
```

Start the development server:

```sh
npm run dev
```

Open the URL printed by Vite. You should see a rough red ellipse around the
email field. The mark stays still until you ask it to redraw.

If no ellipse appears, confirm that `@funsaized/stet/style.css` is imported. The JavaScript
creates paths; the stylesheet positions and paints them.

## 4. Add a readable note

Import `sticky` and attach it to the same input:

```js
import { circle, sticky } from "@funsaized/stet";
import "@funsaized/stet/style.css";

const email = document.querySelector("#email");
const sketch = circle(email, { stroke: "crimson" });
sticky(email, { text: "Use your work address", side: "right" });
```

You should now see a paper note beside the field. The note uses a text node, so
assistive technology can read it with the input.

## 5. Redraw on demand

Replace `src/main.js` with the completed version:

```js
import { circle, sticky } from "@funsaized/stet";
import "@funsaized/stet/style.css";

const email = document.querySelector("#email");
const sketch = circle(email, { stroke: "crimson" });
sticky(email, { text: "Use your work address", side: "right" });

const redraw = document.querySelector("#redraw");
redraw.addEventListener("click", () => {
  sketch.resketch();
});
```

Each click creates a new variation.

## 6. Verify the result

Check these behaviors in the browser:

1. The email field still accepts focus and text.
2. Hovering over it leaves the circle still by default.
3. The button redraws the circle.

The form keeps its native behavior while `stet` owns only the annotation.

For playful interactions, opt in with `resketchOnHover: true`. For movement
caused by your application, call `sketch.refresh()` to preserve the current
seed. Both scroll tracking and resize tracking happen automatically.

## Next steps

- Look up every primitive and option in the [API reference](reference.md).
- Read [how stet marks live UI](explanation.md) for the design model.
- Adapt the [framework examples](../examples/) to your app.
