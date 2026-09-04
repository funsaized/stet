# Stet Svelte demo

Vite's official Svelte starter page, marked up with every action from
`stet/svelte`.

From the repository root, build Stet and install the demo dependencies:

```sh
npm run build
npm --prefix examples/svelte install
```

Then start the app and open <http://localhost:5173/>:

```sh
npm --prefix examples/svelte run dev
```

The demo installs Stet from the repository through `file:../..`, so rebuilding
and reinstalling picks up local library changes.
