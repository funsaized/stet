# Svelte

Read `stet snippet <primitive> --framework svelte`. Actions attach to an existing
native host and clean up with that host. Simple actions accept omitted options.
Sticky takes text, mark takes kind in options, arrow takes to as a real Element.
The shipped snippets use legacy-compatible Svelte syntax, supported by Svelte 5;
follow the application's established syntax when adapting them.

The arrow sample gates its host until bind:this supplies the destination. If the
real control must stay visible before the destination exists, preserve it and
use core arrow in an onMount/reactive lifecycle with explicit cleanup. Do not
pass undefined to the arrow action. To disable only an annotation while retaining
its host, manage core handles in the application's lifecycle. Do not invent an
enabled option. Action update/destroy handle option changes and host removal.

## Persistent controls and changing targets

Use `stet snippet --pattern lifecycle --framework svelte` for grouped marks,
enable/disable, missing/replaced destinations and teardown. The control stays
mounted. The component owns cleanup and rolls back partially attached groups;
fixed seeds survive reattachment. Adapt destination state to actual source refs,
and run the app and browser checks after editing. Arrow labels describe the
destination; use description on the source when its meaning needs explanation.
