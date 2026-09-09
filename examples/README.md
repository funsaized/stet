# Examples

Start with the [unified live use cases](https://www.stetkit.com/use-cases) or
[run the website locally](../website/README.md). These framework demos explain
integration and exercise API coverage; the showcase explains workflows.


Run commands from the repository root. First install dependencies with `npm ci`.
The framework demos label their opt-in boiling underlines and arrows; all motion
respects the system’s reduced-motion preference. Stop any server with Ctrl+C.

Each page is visibly “stet-ified”: two separate paper notes with color-matched
arrows, a colorful review strip, and native controls that still work. The Svelte
notes keep their paper backgrounds in dark mode for readable contrast.

After installing the framework dependencies below, run `npm run test:demos`
to check all five pages at desktop and mobile sizes in Chromium and Firefox.
This starts and stops its own servers; the React API response is stubbed in tests.

## Vanilla

The vanilla example imports the built ESM package. Build the library, then
serve the repository over HTTP:

```sh
npm run build
python -m http.server 4173 --bind 127.0.0.1
```

Open <http://localhost:4173/examples/vanilla/>.

Do not open `examples/vanilla/index.html` through `file://`. Browsers block its
module import because local files have a `null` origin.

## Angular

The Angular example is a runnable Angular CLI 20 app that exercises every Stet
directive on the generated welcome page:

```sh
npm run build
npm --prefix examples/angular install
npm --prefix examples/angular start
```

Open <http://localhost:4200/>.

## React

The React example is a runnable Vite app based on TanStack Query's official
simple example. It exercises every Stet React component:

```sh
npm run build
npm --prefix examples/react install
npm --prefix examples/react run dev -- --host 127.0.0.1 --port 5173
```

Open <http://localhost:5173/>.

## Svelte

The Svelte example is a runnable Vite app based on the official Svelte starter.
It exercises every Stet Svelte action:

```sh
npm run build
npm --prefix examples/svelte install
npm --prefix examples/svelte run dev -- --host 127.0.0.1 --port 5174
```

Open <http://localhost:5174/>. Separate ports let React and Svelte run together.

## Vue

After building the library, use the same HTTP server as the vanilla example
and open <http://localhost:4173/examples/vue/>. This local example imports the
installed Vue browser build and exercises every directive, reactive options,
and unmounting. `App.vue` remains a minimal component to copy into a Vue app.

## Visual specimens

Open <http://localhost:4173/examples/visual/> for a fixed-seed matrix covering
light/dark/colored surfaces, wrapped text, controls, images, transforms, and
nested scrolling. It is also the browser regression fixture.

```sh
npx playwright install chromium firefox
npm run test:browser -- --project=chromium --project=firefox
```

Use `--update-snapshots` only after inspecting a deliberate visual change.
Baselines are platform-specific; the checked-in screenshots were captured on
Linux. WebKit is opt-in through `STET_WEBKIT=1`; it requires its platform
libraries and reviewed baselines before it can be included in a passing run.
