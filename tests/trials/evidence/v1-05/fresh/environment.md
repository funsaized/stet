# Local browser launch environment

Some trial-agent commands could not start Chromium inside the command sandbox.
Raw events retain server-bind `EPERM`, browser launch failures and the checks that
were consequently unavailable. The first recovery agent reported that limitation
instead of claiming browser success. The primary implementer ran the independent
browser checks through authorized execution outside the command sandbox. The
fresh recovery rerun enabled automatic approval review for browser-access requests.
Both the final matrix and the separate artifact replay passed 27/27.

The maintainer supplied a coredump diagnosis during this work. Their report
identifies the same Chromium startup abort in three cores: the fatal log at
`sandbox_host_linux.cc:41` records `shutdown: Operation not permitted (1)` while
initializing sandbox IPC. Chromium intentionally traps, recorded as SIGTRAP,
before loading a page. This report was supplied by the maintainer; the evaluation
run did not independently symbolize or inspect those cores. No cores are included
in this evidence archive.

The failed syscall/startup abort is established by that report. The outer command
sandbox is a plausible cause, consistent with successful authorized launches
outside it, but the exact mechanism was not established here. The report excludes
OOM and an Omarchy packaging failure; no upstream issue, desktop configuration or
package change was made during these trials.

The earlier 5/6 trial check run failed because the baseline supplied only a prose
plan, not because a page assertion crashed. An aborted browser launch is neither
a UI regression nor a completed browser check. Only successful later launches and
explicit checks are counted as browser evidence. Further local launches use the
approved outer-sandbox execution path, retaining the same bundled browser version
as the test configuration instead of silently changing comparison baselines.
