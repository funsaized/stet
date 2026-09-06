# React

Read `stet snippet <primitive> --framework react`. Components render null and
receive refs to existing DOM nodes. They do not wrap children. Sticky uses text,
not children. Arrow uses from/to refs; no selector prop exists. Keep the required
CSS import in the app's permitted global entry and the component on the client
side of an SSR boundary.

The snippet demonstrates an enabled prop: conditional annotation components leave
controls mounted. Compose multiple annotation components against existing refs.
Effects manage update/cleanup, including Strict Mode. A ref's DOM node can change
on a React commit; mutations outside rendering need an application render. Verify
conditional removal and route navigation leave no stale overlays/descriptions.
