# Explain an implementation handoff

Use after implementation, when the requested explanation is about what changed.
Inspect the actual diff and working controls. Separate implemented behavior,
checks you actually ran, and follow-up work. A passing build does not establish
interaction behavior or visual quality; an annotation is never test evidence.

Annotate meaningful changes only. Use concise delivery copy such as “Exact-name
confirmation added”; reserve “verified” for behavior supported by your recorded
checks. Put untested claims and remaining work in the handoff text instead of
turning them into green checks. Keep safety warnings in the application.

Preserve the new controls and their layout. Prefer a focal circle or underline
when a note would repeat native copy. Group cleanup in the framework's existing
lifecycle. Provide the plan, changed source and actual verification results so a
human can review the working UI with marks on or off.

This is an explanation of completed work. A request to find defects uses the
review workflow; a request to present product value uses showcase. A handoff
request alone does not authorize unrelated implementation or deployment.
