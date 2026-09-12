# Playwright integration contract

Status: approved product boundary; loading details are evidence-gated by `PW-01`
and `PW-02`

## Package boundary

- Ship a supported optional `@funsaized/stet/playwright` entry.
- Build its browser payload while building Stet.
- Load package-local assets; never fetch a CDN.
- Consumers do not need esbuild.
- Callers supply their own Playwright installation and objects.
- Browser-core graphs contain no Node or Playwright code.

## Behavior

- Create an owned annotation session for a `Page` or same-origin `Frame`.
- Accept Playwright locators and require exactly one live target at attachment.
- Validate that targets belong to the session document.
- Expose asynchronous remote handles matching the runtime result semantics.
- Multiple sessions and source-authored Stet annotations coexist.
- Cleanup removes only resources owned by that session.
- Navigation invalidates the document and cancels pending work.
- Do not automatically reinject, rediscover targets, or cross documents.
- Cross-document arrows and cross-origin frames are unsupported initially.
- Do not silently enable CSP bypass.

Missing, ambiguous, detached, wrong-document, navigation, loading, and CSP failures
must be distinguishable and actionable. Normal runtime animation cancellation is
not an exceptional browser error.

## Evidence gates

`PW-01` must prove renderer and stylesheet loading, restrictive-CSP behavior,
Chromium and Firefox, same-origin frames, rollback, and source-authored
coexistence. WebKit evidence may be collected with `STET_WEBKIT=1`, but is not a
first-release support gate unless that run is made mandatory before release.

`PW-02` must prove packed payload discovery, no consumer bundler dependency,
navigation cancellation, cleanup ownership, and browser-core isolation.

No worker may invent the final loader before both gates are accepted.
