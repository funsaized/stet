# Delivery evidence

Evidence summaries record what was actually checked without copying generated test
output into the repository.

Use this template:

```md
# <task> evidence

- Revision/base:
- Environment:
- Files changed:
- Acceptance criteria checked:
- Commands and exit status:
- Browser/manual artifacts:
- Pre-existing failures:
- Unverified items and reason:
- Reviewer decision:
```

Rules:

- Never report an unrun or unavailable check as passing.
- Link retained artifacts where required; do not commit ordinary temporary output.
- Keep first-attempt failures distinct from corrected results.
- A visual snapshot does not prove behavior, and an annotation does not prove QA.
- Simulated users do not count as adoption or retention evidence.
- External research, outreach, publication, and release require authorization.
