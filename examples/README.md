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

## Frameworks

The React, Vue, Svelte, and Angular directories contain the minimal source for
each adapter. Copy the matching file into an existing app that has `stet` and
the framework installed. Import `stet/style.css`; Angular apps can add it to
the application `styles` list.
