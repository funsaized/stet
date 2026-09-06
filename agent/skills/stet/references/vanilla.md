# Vanilla

Read `stet snippet <primitive> --framework vanilla`. Import CSS once. Pass actual
Elements after document.body and targets exist. Check missing/ambiguous queries
before attaching; do not silence TypeScript with a non-null assertion on an
unverified selector. Core attachers are client-only, not SSR no-ops.

The snippet's annotate function returns refresh/destroy. Retain its result and
call destroy before discarding the target or leaving the view. For several marks,
keep an array of handles and destroy every handle. To toggle annotations, destroy
on disable and attach on enable without replacing the underlying controls. Avoid
reattaching on every render. Options are snapshotted; change them by destroying
and reattaching. Refresh after application-driven movement without resize; it
preserves the seed. Resketch changes the drawing rather than options.

## Persistent controls and changing targets

Use `stet snippet --pattern lifecycle --framework vanilla` for grouped marks,
enable/disable, missing/replaced destinations and teardown. The control stays
mounted. The component owns cleanup and rolls back partially attached groups;
fixed seeds survive reattachment. Adapt destination state to actual source refs,
and run the app and browser checks after editing. Arrow labels describe the
destination; use description on the source when its meaning needs explanation.
