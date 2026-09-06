# Optional assistive-technology walkthrough

Run `npm run test:patterns`, then serve the repository with
`python -m http.server 4177 --bind 127.0.0.1`. Open
`http://127.0.0.1:4177/test-results/patterns/react.html` (replace react with any
framework). These are disposable verification pages, not production warnings.
Screenshots from automated runs live under `test-results/pattern-runs/`.

With a screen reader and keyboard, focus “Review action”. Its name should remain
unchanged and its descriptions should explain the mark and note. Use the console
`trial.update(true, 1)` to show the destination and arrow: read the destination's
arrow description. `trial.update(false, 0)` removes annotation descriptions while
the button stays focusable and submits its form. `trial.update(true, 2)` replaces
the destination; `trial.unmount()` cleans up the component and annotations.

For dangerous settings, use the prepared trial app: Delete saved settings retains
its native confirmation, and its existing warning says the account and documents
are kept. Dismiss the confirmation once, accept it once, and verify the status.
Annotations must never replace this application-owned warning or confirmation.

Automated browser tests cover description ownership, keyboard focus, pointer and
form behavior, narrow layouts, scrolling, motion preference and cleanup. They do
not establish a full accessibility certification. Real screen-reader feedback
is optional and should name the browser/reader/version and observed announcement.
