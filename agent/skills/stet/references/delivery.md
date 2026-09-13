# Choose source or injection

Choose from the requested artifact and lifetime:

- **Application source:** use for durable documentation, onboarding, product UI,
  or any annotation that must ship or run without a Playwright caller. Use the
  framework lifecycle reference and the shipping boundary when temporary review
  content runs inside the app.
- **Playwright injection:** use `@funsaized/stet/playwright` only for a temporary
  screenshot or test artifact when the caller already owns a supported Playwright
  `Page` or same-origin `Frame`, including an inherited-origin `about:blank` frame.
  Dispose the session in `finally`; injection does not modify application source.

```ts
import { createStet } from "@funsaized/stet/playwright";

const stet = await createStet(page);
try {
  const note = await stet.circle(page.getByRole("button", { name: "Save" }));
  await note.show();
  // Capture or assert the temporary artifact here.
} finally {
  await stet.dispose();
}
```

Ask one precise question when “annotate this” does not reveal whether the result
is durable application UI or a temporary capture/test. Also ask when the browser
context or target lifetime determines whether injection is supported. Do not
silently switch delivery methods.

Injection supports Chromium and Firefox current-page and same-origin-frame
documents. It does not support cross-origin/opaque frames, workers, browser
contexts, element handles, or cross-document arrows, and it does not reinject or
rediscover after navigation. A `Locator` or `FrameLocator` is not a session
context. Detached frames are unsupported; navigation or frame detachment
permanently invalidates the session, so create a new one. The page CSP must permit
same-origin scripts and styles. A target `Locator` must belong to the session's
bound document; another document is rejected. WebKit is not claimed.

Neither path performs product QA. Independently verify target identity, native
focus/click/form behavior, layout, accessible descriptions, pointer behavior, and
cleanup. Stet does not run agents, apply annotation plans, edit source
automatically, contact users, publish, or deploy.
