# Delete consequences arrow

1. Attach refs directly to the existing `#delete` button and `#consequences` paragraph in [App.tsx](App.tsx). The paragraph is conditional on `destination > 0` and keyed by `destination`; the button stays mounted and retains its warning, confirmation, type and handler.
2. Use the installed `@funsaized/stet` 0.0.2 React `Arrow` with `from` and `to` refs, as declared in [react.d.ts](node_modules/@funsaized/stet/dist/react.d.ts) and illustrated by `stet snippet arrow --framework react`. Import the exported stylesheet in App.
3. Recover the proposed options: `stet validate stet-plan.json --json` rejected `annotations[0].options.color` with `INVALID_OPTION`. The installed `stet inspect --json` arrow schema accepts `stroke` and `label`. Replace `color` with `stroke: "red"`, preserve the requested label, and set seed 42 for repeatable geometry. The corrected authoring plan is [stet-plan.json](stet-plan.json).
4. Keep the Arrow mounted while enabled, even with a missing destination. In [react.js](node_modules/@funsaized/stet/dist/react.js), `useTargets` reads ref contents after each commit, destroys the previous handle when node identity changes, attaches only when both nodes exist, and destroys on unmount. This covers initial absence, readiness, keyed replacement, disappearance, enable/disable and teardown. The label describes the destination; the button keeps its native warning.
5. Revalidate the plan and run `npm run check` and `npm run build`, the app scripts defined in [package.json](package.json). Exercise lifecycle and deletion behavior in a browser if available, including keyboard interaction and narrow layout. Validation alone does not verify live targets or visual placement.

## Verification results

- Corrected plan validation passed with no errors or warnings.
- `npm run check` and `npm run build` both passed the application compiler and browser bundle.
- Browser verification could not run: local server binding failed with `EPERM`, and a server-free attempt using request interception failed when Chromium launch was blocked by the sandbox (`Operation not permitted`). Lifecycle handling is supported by the inspected adapter source, but browser behavior and visual layout remain unverified.
