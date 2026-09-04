# Stet Angular demo

The stock Angular CLI 20 welcome page, marked up with every directive from
`stet/angular`.

From the repository root, build Stet and install the demo dependencies:

```sh
npm run build
npm --prefix examples/angular install
```

Then start the app and open <http://localhost:4200/>:

```sh
npm --prefix examples/angular start
```

The demo installs Stet from the repository through `file:../..`, so rebuilding
and reinstalling picks up local library changes.
