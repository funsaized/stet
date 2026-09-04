# Examples

## Vanilla

The vanilla example imports the built ESM package. Build the library, then
serve the repository over HTTP:

```sh
npm run build
python -m http.server 4173
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
npm --prefix examples/react run dev
```

Open <http://localhost:5173/>.

## Other frameworks

The Vue and Svelte directories contain the minimal source for each adapter.
Copy the matching file into an existing app that has `stet` and the framework
installed, then import `stet/style.css`.
