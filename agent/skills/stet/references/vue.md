# Vue

Read `stet snippet <primitive> --framework vue`. In script setup, import the
vStet-named directive from the adapter; it binds to the existing native host.
There are no Stet Vue wrapper components. Values are options objects; arrow's to
is a destination Element. Vue template refs are unwrapped in templates.

The arrow snippet waits for the destination ref before mounting its sample host.
When adapting an already interactive control, preserve its availability: if it
must remain mounted while the destination is absent, use the core arrow inside
an onMounted/watch lifecycle with explicit cleanup instead of hiding the control.
Do not pass null to the arrow directive. Mutated option values are snapshotted
when updated hooks run. Removing a directive host cleans up its annotation; use
core handles if toggling only the annotation without removing the host is needed.
