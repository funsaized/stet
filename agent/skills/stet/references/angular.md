# Angular

Read `stet snippet <primitive> --framework angular`. Import the standalone
Stet*Directive in the component's imports, then bind the stet* input on an
existing native host. Import Stet CSS in the global stylesheet; component-scoped
styles do not own the body overlay. No CUSTOM_ELEMENTS_SCHEMA is needed.

Arrow to is a native template-reference Element, not ElementRef or a component
instance. Keep its destination present before the source directive attaches.
If the destination is conditional while the source control must remain usable,
manage core handles at afterNextRender with explicit cleanup instead of removing
the control. Replace input option objects when updating. There is no enabled
input: use core lifecycle management to toggle only an annotation on a persistent
host. The directive itself cleans up on destruction and skips server attachment.

## Persistent controls and changing targets

Use `stet snippet --pattern lifecycle --framework angular` for grouped marks,
enable/disable, missing/replaced destinations and teardown. The control stays
mounted. The component owns cleanup and rolls back partially attached groups;
fixed seeds survive reattachment. Adapt destination state to actual source refs,
and run the app and browser checks after editing. Arrow labels describe the
destination; use description on the source when its meaning needs explanation.
