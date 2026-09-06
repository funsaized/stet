Stet arrow implementation plan

1. Use the existing `App.tsx` button `id="delete"` as the source and paragraph
   `id="consequences"` as the destination, in that order. Each occurs once in
   App. The paragraph is conditional on `destination > 0` and keyed by
   `destination`; the button is unconditional and retains its confirmation,
   `type="button"`, handler and `aria-describedby="native-warning"`.
2. Installed `@funsaized/stet` version 0.0.2 (`package.json` in the package,
   `stet inspect --json`, and `stet schema annotation-plan`) accepts arrow
   `stroke` and `label`, but not `color`. Validating the original proposal in
   `stet-plan.json` returned exit 1, `INVALID_OPTION` at
   `annotations[0].options.color`. Replace `color` with `stroke`, retain the
   proposed label, add fixed seed 42, and revalidate the same file.
3. Adapt `stet snippet arrow --framework react`: refs on existing elements,
   null-rendering `Arrow` from `@funsaized/stet/react`, and the package CSS.
   Installed `dist/react.d.ts` declares `from`/`to` as Element refs.
   `dist/react.js`, `useTargets`, reads current nodes on every commit, destroys
   the old handle on node/option changes, attaches only when both nodes exist,
   and destroys on unmount. Thus initial absence, readiness, keyed replacement,
   removal, enable/disable and teardown do not require remounting the control.
4. Run plan validation and both app scripts (`check` and `build`, which run
   `build.mjs`: TypeScript checking and browser bundling). Check the rendered
   app's lifecycle, confirmation, keyboard/form behavior, description cleanup
   and wide/narrow placement where browser access is available. Validation alone
   does not establish browser behavior or label clearance.

All package evidence above is from this app's installed
`node_modules/@funsaized/stet`, not an external repository.

Browser recovery: the API-valid floating label overlapped the native warning at
375px wide. Use the supported `description` option with the same wording instead
of `label`; the existing visible paragraph explains the destination. This follows
the installed skill's `references/primitives.md` guidance for label collisions.
The final plan records this adjustment.

Verification completed:

- Final `stet validate stet-plan.json --json`: exit 0, no errors or warnings.
- `npm run check` and `npm run build`: both pass after the final adjustment.
- Browser: initial missing destination, appearance, keyed replacement,
  disappearance, disable/re-enable and unmount pass; the same delete element
  retains focus and its native warning. Old destination descriptions and
  overlays are cleaned up. Final accessible description resolves correctly.
- Keyboard Enter cancellation and Space confirmation, deletion status, no form
  submission from Delete, and successful Save submission were checked.
- Inspected wide and 375px screenshots with reduced motion. Removed the floating
  label after the narrow overlap was observed and inspected the corrected view.
  The arrow still traverses the intervening warning; Stet has no collision router.
- Browser console contained only an unrelated missing favicon 404.
