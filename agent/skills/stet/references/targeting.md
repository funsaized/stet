# Source targets and plans

A target is a source-editing instruction, never evaluated by Stet. `file` locates
application source, `locator` records a ref name, stable identifier or source
location, and `description` explains the intended element. Resolve every target
in source and verify the rendered element. A description alone is insufficient.

Prefer, in order:

1. Existing framework ref, directive or action host.
2. Stable existing id.
3. Stable existing data/test attribute.
4. Semantic source element with a source location and identifying context.
5. Add a deliberate `data-stet` attribute if useful and consistent with the app.
6. Structural CSS only with a recorded `rationale` explaining why better targets
   are unavailable; verify exact match count. Avoid nth-child as a default.

Do not turn locators into `querySelector` calls automatically. In vanilla, resolve
an existing stable id or check a query matches exactly one Element before attach.
Framework targets are DOM Elements, not component instances. Arrow targets are
ordered from then to and must both be ready. If a list repeats a target, use the
item's stable key and source context, not its current index.

Example authoring plan (adapt the file/ref to real source):

```json
{
  "version": 1,
  "framework": "react",
  "intent": "Explain the consequences of deleting an account",
  "annotations": [{
    "id": "delete-consequences",
    "primitive": "sticky",
    "targets": [{
      "strategy": "ref",
      "file": "src/Settings.tsx",
      "locator": "deleteButtonRef",
      "description": "Existing Delete account button"
    }],
    "options": {"seed": 42, "text": "Deleting removes this account's saved settings."}
  }]
}
```

Verify that the consequence is true in the application. The plan is not evidence
that this ref exists or that deletion has those effects. Validate it, then adapt
an installed snippet. Keep application conditionals and target lifetimes aligned.

The installed `agent/examples/settings.plan.json` is a validated starting point
with mark and arrow variants. Its `src/settings.html` and IDs are illustrative.
Replace every target and consequence using inspected source before validation;
never manufacture refs just to make the example appear resolved. Use
`stet inspect --project . --json` to narrow the application and installed binary.
