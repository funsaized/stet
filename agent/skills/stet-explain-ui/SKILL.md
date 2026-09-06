---
name: stet-explain-ui
description: Create an annotated UI explanation with Stet for documentation, onboarding, tutorials or educational interfaces. Use when the task is to teach controls or a flow, including a settings screen with dangerous actions. Excludes visual QA verdicts, product marketing showcases and isolated API edits.
---

# Stet explain UI

Start with the reader's question: what can they do here, and what consequence
would surprise them? Inspect the real screen and source before writing copy.
Use one focal mark for the main action and concise notes for information that is
not already evident. Underline words rather than circling entire panels when
teaching terminology. Use an arrow only when a relationship needs explanation.

For dangerous actions, verify the actual consequence in source and state it
plainly. Preserve persistent warnings and confirmations. An annotation is
supplemental; it must not turn into the application's safety mechanism. Do not
mark a legitimate dangerous action as “wrong” merely because it is destructive.

Prefer a small hierarchy over equal emphasis on every control. Check reading
order, narrow-screen overlap and whether the copy repeats existing descriptions.
Use the [base Stet workflow](../stet/SKILL.md) to inspect installed facts, plan,
validate and implement in the detected framework. Verify a reader can understand
the action while the original controls retain their behavior.
