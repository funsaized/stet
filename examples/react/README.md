# Stet React demo

A Vite React app based on TanStack Query's official simple example, marked up
with every component from `stet/react`.

From the repository root, build Stet and install the demo dependencies:

```sh
npm run build
npm --prefix examples/react install
```

Then start the app and open <http://localhost:5173/>:

```sh
npm --prefix examples/react run dev
```

The demo installs Stet from the repository through `file:../..`, so rebuilding
and reinstalling picks up local library changes.
