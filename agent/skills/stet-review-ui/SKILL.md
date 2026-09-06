---
name: stet-review-ui
description: Annotate UI with Stet for design review, QA, critique or right/wrong examples when the requested output is visual feedback. Excludes ordinary code review, database fixes, explanatory onboarding and marketing showcases.
---

# Stet review UI

Separate observed defects from preferences before choosing a verdict. Inspect
the interface and cite the visible behavior or source that supports each note.
Use right/wrong marks only when the criterion is clear; a circle and neutral
note are better for an open question. Match each verdict with text explaining
what to change or preserve. Do not use color alone.

Keep the underlying interface representative. Adding annotations does not
justify changing semantics, removing validation or fixing the application under
the guise of review. Apply requested fixes only within the user's scope. For
side-by-side examples, target each example explicitly instead of connecting
unrelated controls. Avoid marking every imperfection at once.

Preserve the examples' existing spacing, widths and order unless layout edits
were also requested. If notes collide, shorten, reposition or remove the notes;
do not resize controls or add gaps just to fit review chrome. A compact verdict
mark with a meaningful accessible description can serve when floating prose
cannot fit. Compare the annotated layout with the original, not only with the
same edited application after annotations are disabled.

Use the [base Stet workflow](../stet/SKILL.md) for installed API facts, validated
plans and framework code. Verify each mark targets the evidence it discusses,
review screenshots at relevant widths, and test that review chrome does not
intercept interactions. Distinguish verified defects from untested hypotheses.
