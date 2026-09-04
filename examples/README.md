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

## Other frameworks

The React, Vue, and Svelte directories contain the minimal source for each
adapter. Copy the matching file into an existing app that has `stet` and the
framework installed, then import `stet/style.css`.
