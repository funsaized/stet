# Diagnose → fix → verify

| Observation | Action | Verify |
| --- | --- | --- |
| Unknown primitive/options | Query installed inspect/schema; correct the plan, do not rename at random | validate exits 0, then app typecheck |
| Missing text/kind or wrong target count | Read the error path and primitive schema | Revalidate the same file |
| Invalid JSON/version/framework | Repair syntax or use supported schema version/framework | validate --json reports ok |
| CLI absent | Check the relevant package's dependency installation and scoped npm name | Local stet --version |
| Missing/ambiguous target | Inspect source and rendered identity; use stable ref/id | One intended Element, both arrow ends ready |
| Invisible/misplaced chrome | Check CSS import, target visibility, lifecycle and supported placement context | Scroll/resize and inspect in browser |
| Drift after app movement | Call retained core handle.refresh(); inspect adapter lifecycle if applicable | Seed unchanged; overlay follows target |
| Stale annotation | Destroy manual handles; align target and adapter mount lifetimes | Navigate/toggle; no stale overlay/description |
| Text overlaps UI | Shorten copy and reduce marks first. Inspect installed support for sticky offsetX/offsetY or arrow labelOffsetX/labelOffsetY; nudge after browser inspection. Curvature adjusts the path, not obstacle routing | Text readable, controls unobscured |
| Skill update conflict | Preserve and reconcile named local files; rerun update | No unrelated config changed |

Exit codes: 1 invalid plan; 2 usage; 3 file/JSON error; 4 installation conflict.
JSON failure output contains errors with path/code/message. Recovery must address
that cause. A successful validation or build is not visual verification. If a
browser cannot run, state that limitation and the exact checks that did run.

Placement nudges use viewport x/y pixels (positive right/down), after automatic
placement and before viewport clamping. They do not detect collisions or force a
preferred side. Recheck at narrow widths; remove redundant labels when possible.
