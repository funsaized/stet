# Executable backlog

See [execution rules](README.md) and the approved [contracts](contracts/).

| ID | Class | Parent | Direct dependencies | State |
| --- | --- | --- | --- | --- |
| BASE-01 | Required | A1/A5/H2 | — | ACCEPTED |
| CONTRACT-01 | Required | A3 | BASE-01 | ACCEPTED |
| CONTRACT-02 | Required | A4/B6 | CONTRACT-01 | ACCEPTED |
| CONTRACT-03 | Required | D1 | CONTRACT-01 | ACCEPTED |
| CONTRACT-04 | Required | E1 | BASE-01, CONTRACT-02 | ACCEPTED |
| CONTRACT-05 | Required | Release planning | CONTRACT-01..04 | ACCEPTED |
| FIX-01 | Required | A1 | BASE-01 | BLOCKED |
| FIX-02 | Required | A6 | FIX-01 | BLOCKED |
| MEASURE-01 | Required | A5 | BASE-01 | READY |
| CORE-01 | Required | B1 | CONTRACT-01 | READY |
| CORE-02 | Required | B2/F1 | CORE-01 | BLOCKED |
| CORE-03 | Required | B2 | CORE-02 | BLOCKED |
| CORE-04 | Required | B2 | CORE-03 | BLOCKED |
| CORE-05 | Required | B4 | CORE-04 | BLOCKED |
| CORE-06 | Required | B5 | CORE-05 | BLOCKED |
| CORE-07 | Required | Required internal B6 subset | CONTRACT-02, CORE-06 | BLOCKED |
| CORE-08 | Required | A5 | MEASURE-01, CORE-06, BOX-02 | BLOCKED |
| AD-REACT | Required | B7 | CONTRACT-02, CORE-06, CORE-07 | BLOCKED |
| AD-VUE | Required | B7 | CONTRACT-02, CORE-06, CORE-07 | BLOCKED |
| AD-SVELTE | Required | B7 | CONTRACT-02, CORE-06, CORE-07 | BLOCKED |
| AD-ANGULAR | Required | B7 | CONTRACT-02, CORE-06, CORE-07 | BLOCKED |
| AD-INTEGRATE | Required | B7/F2 | All AD tasks | BLOCKED |
| BOX-01 | Required | C1 | CORE-06 | BLOCKED |
| BOX-02 | Required | C1/F1 | BOX-01, AD-INTEGRATE | BLOCKED |
| PW-01 | Required gate | D1/D2 | CONTRACT-03 | READY |
| PW-02 | Required gate | D1/D2/D3 | PW-01, CORE-05 | BLOCKED |
| PW-03 | Required | D2 | PW-02 | BLOCKED |
| PW-04 | Required | D2/D3 | PW-03 | BLOCKED |
| PW-05 | Required | D3 | PW-04, CORE-05 | BLOCKED |
| PW-06 | Required | D1/D3 | PW-05 | BLOCKED |
| PW-07 | Required | D4 | PW-05, CORE-06 | BLOCKED |
| PW-08 | Required | D6 | PW-05 | BLOCKED |
| SHIP-01 | Required | E2 | CONTRACT-04 | READY |
| SHIP-02 | Required | E4 | SHIP-01 | BLOCKED |
| SHIP-03 | Required | E1/F4 | SHIP-02 | BLOCKED |
| AGENT-01 | Required/final audit | F1 | AGENT-02, PW-03, AGENT-03 | BLOCKED |
| AGENT-02 | Required | F2 | AD-INTEGRATE, CORE-05, BOX-02 | BLOCKED |
| AGENT-03 | Required | F3 | PW-06, SHIP-03 | BLOCKED |
| HANDOFF-01 | Required | D7 | PW-07, PW-08, AGENT-03 | BLOCKED |
| WEB-01 | Required | G1 | FIX-01, CORE-06 | BLOCKED |
| WEB-02 | Required | G2 | FIX-02, AGENT-02, HANDOFF-01, WEB-01 | BLOCKED |
| DOCS-01 | Required | A2/G4 | BOX-02, PW-06, SHIP-03 | BLOCKED |
| RELEASE-01 | Required gate | H2 | CONTRACT-05, FIX-01..02, MEASURE-01, CORE-01..08, all AD, BOX-01..02, PW-01..08, SHIP-01..03, AGENT-01..03, HANDOFF-01, WEB-01..02, DOCS-01 | BLOCKED |
| RELEASE-02 | Required gate | A1/G1/G2 | RELEASE-01 | BLOCKED |
| FOLLOW-01..14 | Conditional/post-release | B3/B8/C2-C6/D5/E3/G3 | See task files | BLOCKED |
| EVIDENCE-01..08 | Human-led | G5/G6/H1/F5/F6 | See task files | BLOCKED |

## Next dispatch

`MEASURE-01`, `CORE-01`, `PW-01`, and `SHIP-01` are ready and may run subject to
the shared-file writer rules. `FIX-01` remains blocked on its explicit lead-approved
parity approach. Playwright implementation still starts only after `PW-01` and
`PW-02` produce accepted evidence. Framework writers start only after the shared
runtime and adapter contract are stable.

## Graph audit

The first-release graph is acyclic. Optional/post-release `FOLLOW-*` work and
human-led `EVIDENCE-*` work are not release prerequisites. In particular,
Playwright injection depends only on required contracts, CORE-05, and PW tasks; it
does not wait on optional primitive reveals, groups, extra primitives, video, a
Vite plugin, or broader examples.

Implementation and verification ownership is unique by release area: FIX owns
A1/A6; MEASURE/CORE-08 own provisional/final size; CORE owns runtime motion;
AD-INTEGRATE verifies adapters; BOX-01/02 own geometry/public box; PW-01..06 own
injection and its permanent matrix, with PW-07/08/HANDOFF owning capture/handoff;
SHIP-01/02 own shipping fixtures/output proof and SHIP-03 owns published rules;
AGENT-01..03 own generated facts/examples/routing; WEB-01/02 own public proof/first
success; DOCS-01 and RELEASE-01 own final limits/integration verification.

Generated files have one source writer at a time: CORE-02, BOX-02, PW-03 (package
export drift only), AGENT-02, AGENT-03 (routing outputs), then AGENT-01's final
audit. Generation always runs through `scripts/agent/generate.mjs`; generated files
are not hand-edited. `src/rough.ts` is written by motion tasks before BOX-01 and is
explicitly out of CORE-07 scope. Website work is serialized by WEB-01 before
WEB-02.

The release critical path is the runtime chain through CORE-07, all adapter tasks,
AD-INTEGRATE, BOX-02, AGENT-02/01, plus parallel Playwright and shipping arms that
converge through AGENT-03, HANDOFF-01, WEB-02, DOCS-01, and RELEASE-01. FIX-01 has
an explicit non-task gate: its parity approach must be lead-approved. CORE-08 has
an explicit lead decision after measurement; neither approval may be inferred by
a worker.
