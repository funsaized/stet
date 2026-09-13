# Stet product direction

Status: proposed product and adoption plan  
Last updated: 2026-09-12

This document records the product direction agreed after reviewing Stet's runtime,
framework adapters, CLI, Agent Skills, evaluation evidence, examples, website,
package metadata, and adjacent markets. It is both a strategy and an execution
plan. It does not describe every item below as an existing capability.

Terms used throughout:

- **Current** means implemented in the published or checked-out project, with any
  version difference called out explicitly.
- **First direction release** means the first release that delivers the new motion
  and Playwright direction. Its version has not been chosen.
- **Proposed** means the behavior needs design and implementation.
- **Deferred** means it should not be built without new evidence.

Approved implementation behavior and executable task packets live in the
[delivery plan](delivery/README.md). Those contracts supersede unresolved API
questions in earlier planning notes.

## 1. Executive direction

> **Stet is a framework-aware library for expressive, optionally animated annotations on
> live interfaces—authored by developers or coding agents, published in websites,
> demonstrations, and presentations, or delivered as inspectable browser
> artifacts.**

Stet should remain one product with two equal authoring paths:

1. A developer uses the typed API and framework adapters directly.
2. A coding agent uses the same API through project-local skills, structured
   plans, canonical snippets, and external verification tools.

The output is the same in both cases: annotations attached to working interface
elements. The author and lifetime vary:

| Dimension | Supported direction |
| --- | --- |
| Author | Developer or coding agent |
| Destination | Live site, interactive documentation, demonstration, presentation, or review artifact |
| Lifetime | Permanent, preview-only, or development-only |
| Delivery | Source-authored or temporarily injected through Playwright |
| Verification | Existing application tests and browser tools, especially Playwright |

The initial adoption wedge remains deliberately narrower than the product:

> **Frontend developers maintaining interactive examples and component
> documentation who need to explain behavior without turning the example into a
> screenshot.**

That wedge offers an identifiable installer, an existing publishing environment,
recurring examples, and a natural public distribution loop. It does not restrict
the runtime to documentation.

Agentic delivery remains first-class. What Stet must not claim is that it runs an
agent, performs QA, applies plans automatically, or supplies collaboration
infrastructure. Stet supplies an agent-ready annotation contract and delivery
workflow; the coding agent and the user's existing tools perform the work.

## 2. Product thesis

### 2.1 The job

Static screenshots are often sufficient for a one-off explanation. Stet earns its
place when the explanation depends on a reader being able to:

- Click, type, focus, submit, or change state.
- See a relationship between controls and resulting behavior.
- Follow an explanation through a live demonstration or presentation.
- Inspect what an agent changed in the interface where it changed.
- Capture a deterministic annotated artifact after reaching a meaningful state.

The hand-drawn style is an attention mechanism and visual identity, not the whole
value proposition. Lifecycle correctness, finite motion, deterministic capture,
and authoring ergonomics turn the visual effect into a usable library.

### 2.2 Why Stet can exist

Stet can occupy the space between four established categories:

- **Rough Notation and custom SVG/CSS:** expressive marks, but limited shared
  lifecycle, framework, and agent contracts.
- **Tour libraries:** sequence and control onboarding, but own more interaction and
  application behavior than Stet should.
- **Feedback products:** capture, persist, assign, and resolve comments, but require
  a service and solve a human-to-work-item workflow.
- **Browser-agent tools:** inspect, operate, and capture interfaces, but do not
  provide a source-owned vocabulary for explaining them.

Stet's intended combination is:

- A small, local, source-owned runtime.
- Expressive primitives, including relationships and notes.
- Finite reveal animation plus optional ambient motion.
- Framework-aware lifecycle behavior.
- Deterministic rendering and honest accessibility boundaries.
- Equal developer and agent authoring paths.
- First-class Playwright verification, capture, and temporary injection.

No individual feature is defensible by itself. Adoption must come from the whole
workflow being easier and more reliable than assembling it ad hoc.

### 2.3 Product boundaries

Stet is not:

- A guided-tour controller.
- A product-adoption analytics platform.
- A drawing canvas or visual editor.
- A feedback database or issue tracker.
- A source-apply engine.
- A browser automation framework.
- A coding agent or orchestration service.
- A visual-regression or QA verdict engine.

Host applications continue to own navigation, application state, focus policy,
progression, persistence, authorization, and business behavior. Playwright or
another browser tool continues to own browser operation and assertions.

## 3. Decision register

### 3.1 Agreed

- Preserve the existing named primitive API rather than replacing it with a
  universal factory.
- Pursue substantial Rough Notation feature coverage while modernizing ergonomics.
- Make animation a first-class product capability.
- Keep reveal animation opt-in; existing static attachment remains the default.
- Supplying reveal-animation options opts an annotation into one reveal on attach;
  `visible: false` defers that reveal until the first `show()`.
- Keep `hide()` immediate. Stet does not animate disappearance in the first
  direction release.
- Use flat `visible`, `animate`, `animationDuration`, and `animationDelay` options.
- Return awaitable `finished` or `cancelled` results from show/replay operations.
- Give every existing framework adapter declarative visibility and imperative
  handle access.
- Keep finite reveal animation separate from ambient `boil` motion.
- Keep developer and agent authoring equally supported.
- Include source-free Playwright annotation injection in the first direction
  release.
- Treat intentional production annotations as supported, not as development code
  that must always be stripped.
- Support explicit production, preview-only, local-only, and mixed shipping modes.
- Preserve a small, local, backend-free core and zero required runtime
  dependencies.
- Use repeat adoption—not feature count, stars, or unexplained downloads—as the
  main product signal.

### 3.2 Approved implementation direction

- Add explicit `show`, `hide`, and `replay` behavior to annotation handles.
- Make finite animation completion awaitable and cancellation-distinguishable so
  consumers can sequence without manually reproducing durations.
- Add a small ordered-group helper once the single-handle contract is stable.
- Add a typed update operation only where remounting causes concrete animation or
  lifecycle problems.
- Put temporary review annotations behind explicit source-module boundaries.
- Expose Playwright support through an optional package entry point if a recipe
  proves insufficient.
- Offer a bounded Vite integration for explicit boundaries only if it materially
  improves the tested workflow.

### 3.3 Evidence-gated questions

- Primitive-specific animation treatments and defaults.
- The proven renderer/stylesheet loading mechanism and detailed CSP compatibility
  for browser injection.
- The revised core and optional-integration size budgets.
- Whether a Vite plugin adds enough value over an explicit conditional module.

### 3.4 Deferred until evidence exists

- Hosted comments, accounts, organizations, and permissions.
- A Stet-owned MCP server.
- Automatic plan application or arbitrary AST rewriting.
- A browser extension or DevTools panel.
- A drag-and-drop annotation editor.
- Automatic diff-to-explanation generation.
- Cross-page tour orchestration and analytics.
- A universal collision-free placement engine.
- Custom primitive plugins.
- Additional framework adapters.

## 4. Current product truth

### 4.1 Runtime

The current runtime exposes six primitives:

| Primitive | Current purpose |
| --- | --- |
| `circle` | Emphasize an element |
| `underline` | Emphasize text, including wrapped lines |
| `highlight` | Apply a marker-like wash behind text |
| `arrow` | Explain a relationship between two elements, optionally with a label |
| `sticky` | Attach a textual note near an element |
| `mark` | Apply a right/wrong proofreader mark |

Every primitive returns a handle containing `resketch`, `refresh`, and `destroy`.
Annotations attach and render immediately. There is no public show/hide state,
finite entrance animation, replay, completion signal, or ordered grouping.
Internally, the mount layer already uses the overlay's `hidden` state for
intersection and offscreen culling. Public visibility must be a separate state so
an observer cannot undo an explicit `hide()`.

The shared mount layer currently handles:

- Resize observation.
- Intersection visibility.
- Nested and document scrolling.
- Font-loading refresh.
- Live reduced-motion changes.
- Deterministic seeds and resketching.
- Accessible descriptions.
- Idempotent cleanup.

`boil` pre-generates path variants and switches between them with CSS. It is an
ambient loop, not a draw-on animation.

### 4.2 Framework adapters

React components, Vue directives, Svelte actions, Angular directives, and the
vanilla API all route into the same runtime. The adapters are deliberately thin.
They generally destroy and recreate a handle when a target or snapshotted option
changes.

This is acceptable for static annotations but can cause accidental reveal replays
once animation exists. Adapter behavior must therefore be included in animation
design rather than patched afterward.

### 4.3 Agent tooling

The CLI currently supports:

- Installed-version and project inspection.
- Capability and annotation-plan schemas.
- Plan validation.
- Canonical primitive and lifecycle snippets.
- Project-local Agent Skill initialization and updates.

The generated plan describes intent, primitive choices, targets, source evidence,
and options. Validation establishes structure and selected semantic constraints.
It does not establish that a target exists, copy is truthful, placement is usable,
or the application works.

The external coding agent edits source. Existing compilers, tests, Playwright, and
human review verify the result. That boundary remains intentional.

### 4.4 Existing Playwright evidence

The repository already uses Playwright to exercise:

- Browser rendering and accessibility behavior.
- Scroll and live reduced-motion behavior.
- Framework lifecycle and observer cleanup.
- SSR/hydration boundaries.
- Demonstration fixtures.
- Retained agent-task artifacts and application behavior.

This is internal verification, not yet a supported consumer integration. The
first-release work should extract the smallest reusable patterns rather than
exporting the entire test harness.

### 4.5 Known limitations

- Arrow paths do not avoid intervening UI.
- Sticky notes and labels do not solve global collisions.
- Top-layer dialogs, cross-document elements, transformed or zoomed roots, and
  some clipped containers are unsupported or constrained. Shadow-root targeting
  has not been established by the current test matrix.
- Accessibility behavior is tested but not a screen-reader certification.
- Browser injection does not yet exist as a supported public API.
- The public website can currently demonstrate checkout-only placement options
  while advertising published `0.1.0`; this must be corrected before feature work
  is promoted.

### 4.6 Size and packaging

The checked-in build measured on 2026-09-12 at approximately 6.83 KiB gzip for the
core JavaScript and 1.11 KiB gzip for CSS. The core budget is currently 7 KiB, so
the proposed functionality cannot be promised within that ceiling without
measurement.

The project should preserve tree-shaking and report at least:

- Minimal single-primitive consumer.
- Full core public surface.
- CSS.
- Each optional integration, especially Playwright and build tooling.

The installed npm package is larger because it includes agent tooling,
documentation, examples, and evidence assets. Browser payload and npm unpacked
size must not be conflated.

The browser runtime is client-side ESM. The CLI currently documents Node 20 or
newer, while the website package declares Node 22.12 or newer and the root package
does not declare an `engines` field. A6 must make these separate build-time and
consumer requirements explicit rather than presenting one ambiguous Node floor.

## 5. Rough Notation capability direction

Rough Notation is a useful baseline because it established familiar annotation
behavior. Stet should cover the useful jobs without claiming drop-in API
compatibility.

| Capability | Current Stet | Direction |
| --- | --- | --- |
| Circle | Present | Preserve and animate |
| Underline | Present | Preserve and animate |
| Highlight | Present | Preserve; add appropriate marker-sweep reveal |
| Box | Missing | Add |
| Bracket on selected sides | Missing | Add |
| Strike-through | Missing | Add |
| Crossed-off | Similar to `mark(element, "wrong")` | Document equivalence and any difference |
| Draw-on animation | Missing | Add as opt-in finite reveal |
| Animation duration | Missing | Add |
| Show/hide state | Missing | Add |
| `isShowing()` | Missing | Expose only if it adds value beyond the chosen visibility contract |
| Explicit replay | Missing | Add rather than requiring hide/show knowledge |
| Ordered groups | Missing | Add after handle completion is stable |
| Group hide | Missing | Include if an ordered-group helper ships |
| Iterations | Missing | Add after reveal model is proven |
| Per-side padding | Scalar only | Add CSS-like shorthand |
| Multiline control | Automatic for selected primitives | Specify and expose only where useful |
| RTL direction | Not explicit | Add deliberate direction behavior |
| Mutable config properties | Remount in adapters | Prefer typed update only where justified |
| Animate by default | No finite reveal | Intentionally differ: static by default, opt-in reveal |

### 5.1 API principles

- Keep named functions such as `circle`, `arrow`, and `sticky`.
- Add named `box`, `bracket`, and `strikeThrough` functions.
- Keep `destroy`; do not add `remove` as a synonym.
- Keep `refresh` separate from `resketch` and animation replay.
- Keep Stet's existing `stroke`, `width`, and `description` vocabulary unless a
  migration reason is stronger than compatibility cost.
- Prefer typed methods over mutable public properties.
- Provide a migration guide instead of permanently supporting two APIs.
- Preserve applicable attribution if source or algorithms are ported rather than
  independently implemented.

### 5.2 Illustrative candidate handle—not the specification

```ts
const emphasis = circle(target, {
  visible: false,
  animate: true,
  animationDuration: 600,
  boil: 0.15,
});

await emphasis.show();
await emphasis.replay();
emphasis.hide();
emphasis.refresh();
emphasis.resketch();
emphasis.destroy();
```

This example illustrates the approved public direction. Exact state transitions
and adapter syntax are defined by the delivery contracts before implementation.

## 6. Motion model

### 6.1 Three independent concerns

**Appearance** controls the settled drawing:

- Seed and roughness.
- Stroke, fill, and width.
- Padding and iterations.

**Reveal** controls finite entrance:

- Initial visibility.
- Enabled state.
- Duration and delay.
- Direction where meaningful.
- Completion and cancellation.

**Ambient motion** controls behavior after reveal:

- Existing boil.
- Hover resketching.
- Capture-time pause or deterministic settling where required.

Changing appearance must not implicitly mean replaying reveal. Ambient motion must
not prevent a finite reveal from completing.

### 6.2 Primitive-specific behavior

A single path animation is not appropriate for every primitive:

- Circle, underline, box, bracket, strike-through, and check/wrong strokes can use
  path-length-based drawing where geometry permits.
- Highlight needs a wash or mask treatment; tracing its filled outline is not a
  convincing highlighter animation.
- Arrow shaft and head need intentional ordering.
- Sticky paper and text should enter coherently rather than animating as an
  arbitrary SVG outline.

Prototype one stroked primitive, highlight, arrow, and sticky before generalizing
the animation implementation.

### 6.3 Runtime invariants

- Animation remains opt-in.
- `refresh()` remeasures without replaying.
- `resketch()` changes geometry without replaying unless explicitly requested.
- Scroll, resize, observer, font, and theme refreshes do not restart reveal.
- Explicit hiding is independent of intersection visibility.
- A hidden annotation has defined accessible-description behavior.
- Reduced motion reaches the final visible state without waiting for a duration.
- Hover resketch never creates a replay loop.
- `hide()` or `destroy()` settles pending completion and removes listeners.
- Repeated and overlapping animation commands have deterministic behavior.
- The original element retains layout, identity, focus, and event behavior.
- An ordered group owns annotation timing only, not application progression.

## 7. Playwright integration

### 7.1 Integration thesis

> **Playwright reaches and checks the state. Stet explains it. Playwright captures
> the result.**

An annotation never proves that the underlying behavior passed. Verification
output must name the assertions and tools that actually ran.

### 7.2 Source-authored workflow

For an application that already contains Stet annotations, a supported Playwright
recipe should:

1. Navigate to the relevant route.
2. Reach a meaningful application state.
3. Show or replay the intended annotations.
4. Await finite animation completion.
5. Verify native control behavior independently.
6. Settle or pause ambient motion as appropriate.
7. Capture a screenshot or recording.

Reusable checks should cover control identity, focus, typing, form behavior,
`aria-describedby` integrity, layout preservation, and teardown.

### 7.3 Browser-injected workflow

The first direction release must also support temporary annotations without
application source edits:

1. Playwright navigates and reaches the desired state.
2. The test resolves targets using Playwright locators.
3. An optional Stet helper loads the renderer into that document.
4. Stet attaches annotations to the resolved elements.
5. The caller awaits reveal and captures the artifact.
6. The helper removes only the annotations it owns.

This workflow is appropriate for temporary review, demonstrations, agent handoffs,
and captured release artifacts. Source-authored annotations remain the better fit
when the explanation belongs in the published application.

### 7.4 Initial support contract to define

- Supported Playwright browser engines.
- Main-document and same-origin frame behavior.
- Explicit handling of cross-origin frames and cross-document arrows.
- Target replacement and navigation behavior.
- Missing and multiple target errors.
- CSP restrictions and failure messages.
- Isolation from source-authored Stet annotations.
- Cleanup after normal completion, test failure, and page navigation.
- Loading of JavaScript and CSS without introducing a core Playwright dependency.

The likely packaging direction is an optional `@funsaized/stet/playwright` entry
point, but the API should first be proven as a repository recipe. Playwright must
not enter the browser core's dependency graph.

### 7.5 Artifacts

The minimum portable handoff consists of existing formats:

- Screenshot or video.
- Preview URL or route.
- Application state/setup description.
- Commit and Stet version where available.
- Plain-language explanation.
- Checks actually performed and remaining uncertainty.

Do not introduce a hosted artifact format before users repeatedly share these
parts and expose a concrete automation gap.

## 8. Shipping and build integration

### 8.1 Supported shipping modes

| Mode | Expected result |
| --- | --- |
| Production | Intentional annotations and runtime ship |
| Preview-only | Review annotations ship in preview builds and are absent from customer production |
| Local-only | Annotations exist only in development |
| Mixed | Intentional production annotations remain while temporary review annotations are removed |

### 8.2 Three distinct guarantees

Documentation and tools must distinguish:

1. **Disabled:** no annotations render, but code or strings may remain.
2. **Runtime excluded:** unused Stet JavaScript and CSS are absent from the output.
3. **Authoring content excluded:** temporary annotation copy, plans, and setup are
   absent from the output.

A no-op adapter can satisfy the first guarantee but cannot prove the third.

### 8.3 Recommended first mechanism

Temporary annotations should live behind an explicit module or component boundary.
The application selects that boundary with a build-time constant or conditional
entry. This allows the bundler to remove the module, its strings, and its imports.

Agent Skills should guide agents to place temporary review annotations inside the
same boundary instead of scattering them through production components.

### 8.4 Vite direction

A thin Vite integration may automate the explicit boundary and provide output
diagnostics. It must not initially attempt arbitrary removal from:

- React JSX and hook ownership.
- Vue directives and single-file component templates.
- Svelte actions.
- Angular directive imports, metadata, and templates.

Generic textual or AST stripping across five compilers is high-risk and
unnecessary for the first useful result. The plain boundary recipe remains the
baseline; retain a plugin only if it is measurably easier and output tests prove
its guarantees.

### 8.5 Build invariants

- Enabled builds render annotations.
- Disabled temporary boundaries leave native application behavior unchanged.
- Temporary copy and plans are absent from the disabled output.
- Stet runtime and CSS are absent when no retained annotation imports them.
- Mixed builds retain intentional production annotations.
- SSR and hydration remain valid.
- Output inspection tests the promise rather than assuming tree-shaking worked.

## 9. Agentic delivery contract

Agent support is not a later documentation task. A public capability is complete
only when both authoring paths can use it correctly.

For every primitive or option, completion includes as applicable:

- Runtime API and TypeScript declarations.
- Vanilla and supported framework adapter behavior.
- Generated capability and annotation-plan schema updates.
- Canonical snippets and lifecycle patterns.
- Agent Skill guidance.
- A runnable verification example.
- Known limitations and recovery guidance.

Temporal orchestration should begin as canonical code and skill guidance. Do not
add a general timeline language to annotation plans until real workflows require
serialization rather than executable host code.

Agent delivery should support two explicit choices:

- **Source-authored:** the explanation belongs in the project or reusable preview.
- **Browser-injected:** the explanation is temporary and primarily becomes an
  inspectable artifact.

The skill must choose based on intended lifetime, not simply prefer the newest
integration.

## 10. Positioning and website direction

### 10.1 Category and value

**Category definition**

> Stet is a code-native annotation library for explaining live interfaces with
> expressive marks, notes, and optional animation.

**Value proposition**

> Explain controls, states, and relationships directly in working websites,
> demonstrations, and presentations—by hand or with a coding agent.

**Recommended hero**

> **Explain the UI. Keep it interactive.**
>
> Add hand-drawn circles, arrows, notes, and animated reveals to working
> interfaces. Write them yourself or ask your coding agent; publish them in the
> site or capture them with Playwright.

### 10.2 Equal authoring paths

The website should present two equally visible starts:

- **Write it yourself:** install, attach one annotation, control its motion.
- **Ask your agent:** install project skills, request an explanation, inspect the
  result and verification evidence.

Both paths must land on the same live example and public runtime rather than
appearing to be separate products.

### 10.3 Proof order

1. A state-dependent live explanation.
2. A short reason it beats a screenshot for that example.
3. Developer and agent starting paths.
4. Animation and presentation examples.
5. Playwright source-free delivery.
6. Compatibility, size, accessibility behavior, and limits.
7. Playground and broader visual gallery.

The existing extended decorative gallery should be condensed or moved below the
task-focused proof. It demonstrates taste but not recurring value.

### 10.4 Honest comparison copy

**Why not screenshots?**

> Use a screenshot when a still image is enough. Use Stet when the explanation
> depends on clicking, typing, changing state, resizing, or revealing ideas in
> sequence. Playwright can still capture the final annotated state when you need a
> portable artifact.

**Why Stet for agents?**

> Stet gives coding agents an installed API contract, framework examples,
> structured plans, and verification guidance. The agent writes or injects the
> annotations; your existing browser and test tools check the application. Stet
> does not run a model or turn an annotation into a QA result.

### 10.5 Recommended primary demonstrations

1. **Why is Save disabled?** Change state and reveal the relevant condition.
2. **The validation message exists, but focus is wrong.** Compare buggy and fixed
   interactions while annotations explain the difference.
3. **This setting changes that result.** Reveal an arrow between control and
   consequence.
4. **Presentation sequence.** Show a small ordered explanation controlled by the
   host page.
5. **Agent handoff without source changes.** Use Playwright to inject, explain,
   verify, capture, and clean up.

## 11. Distribution and adoption

### 11.1 Initial channels

| Audience | Message | Artifact | Desired action |
| --- | --- | --- | --- |
| Storybook maintainers | Explain a component state next to the working component | One complete story recipe | Retain Stet in one real story |
| Interactive-doc authors | Use live annotations when screenshots lose behavior | Runnable starter | Publish an annotated example |
| Rough Notation users | Compare lifecycle, relationships, motion, and framework support | Honest migration example | Evaluate Stet in an existing project |
| Coding-agent users | Ask the agent to leave an inspectable UI explanation | Prompt, diff, preview, and retained failure | Repeat on a second task |
| Playwright users | Reach, explain, check, and capture in one browser workflow | Source-free injection recipe | Produce a real artifact |
| Presentation authors | Add finite hand-drawn reveals without adopting a tour engine | Host-controlled sequence example | Use it in a live presentation |

Specific working artifacts should lead distribution. Generic social promotion,
framework-wide announcement blasts, and unexplained benchmark claims should not.

### 11.2 Success measures

The primary measures are:

- Successful first annotation.
- Successful first injected artifact.
- Retained annotation after 30 days.
- Use on a second example or task.
- Public external examples.
- Qualified issues and reproductions.
- Non-maintainer contributions.

Supporting funnel measures include visitor-to-GitHub, install-command copies,
framework selection, starter completion, playground code copy, and agent-skill
guide completion.

Stars and raw npm downloads indicate awareness at best. Public npm totals cannot
reliably distinguish users, CI, mirrors, and maintainer activity.

### 11.3 Privacy

- No runtime or CLI telemetry by default.
- Website events contain no copied code, selectors, annotation text, or form data.
- Local traffic remains excluded.
- First success and repeated use are collected through voluntary confirmation,
  consented pilots, public examples, and issue/discussion activity.

## 12. Demand experiments

Use one initial cohort of roughly twelve to sixteen qualified participants where
possible: primarily documentation/Storybook authors and Playwright-using agent
adopters. The audience counts below describe eligible observations, not separate
additive recruitment quotas. Rough Notation migration is a later specialist
cohort. The shared 30-day target is eight completed workflows, four retained uses,
and two second uses.

### Experiment 1: interactive documentation adoption

- **Hypothesis:** documentation authors retain annotations when they clarify live
  state or behavior.
- **Audience:** ten maintainers with an existing interactive example.
- **Artifact:** one starter and optional short assisted setup.
- **Channel:** direct, relevant outreach and the Storybook community.
- **Metric:** four published/retained examples and two second uses within 30 days.
- **Time box:** three weeks plus 30-day follow-up.
- **Decision:** continue the wedge if repeated use occurs; do not infer demand from
  playground use alone.

### Experiment 2: live explanation versus screenshot

- **Hypothesis:** live annotations improve understanding for state-dependent tasks.
- **Audience:** eight to twelve developers reviewing unfamiliar UI.
- **Artifact:** matched screenshot/prose and live-annotation explanations.
- **Channel:** recruited review sessions.
- **Metric:** task accuracy, time, missed behavior, and preference.
- **Time box:** two weeks.
- **Decision:** claim an advantage only for task classes where live interaction
  wins without increasing errors.

### Experiment 3: Storybook installation

- **Hypothesis:** an existing component workshop removes enough adoption friction.
- **Audience:** eight Storybook users.
- **Artifact:** a recipe using the published package, not a new addon.
- **Channel:** Storybook community and targeted maintainer outreach.
- **Metric:** four unassisted completions within fifteen minutes and two retained
  stories.
- **Time box:** two weeks.
- **Decision:** build an addon only if retained users repeatedly request the same
  missing control.

### Experiment 4: source versus injected agent handoff

- **Hypothesis:** both delivery modes improve review over an ordinary summary, and
  users choose them based on intended lifetime.
- **Audience:** six frontend engineers using coding agents and Playwright.
- **Artifact:** matched UI tasks with ordinary, source-authored, and injected
  handoffs.
- **Channel:** direct recruitment from agent-tool communities.
- **Metric:** correction time, false claims, review accuracy, setup cost, and reuse.
- **Time box:** three weeks.
- **Decision:** keep both paths prominent only if each has a repeated job; simplify
  to the winning path if one is consistently unnecessary.

### Experiment 5: Rough Notation migration

- **Hypothesis:** lifecycle, framework support, relationships, and modern motion
  create a noncosmetic switching reason.
- **Audience:** five current Rough Notation or custom-overlay users.
- **Artifact:** behavior comparison and migration example.
- **Channel:** permission-based direct outreach and problem-oriented search pages.
- **Metric:** two real evaluations and one retained switch naming a noncosmetic
  benefit.
- **Time box:** three weeks.
- **Decision:** invest in migration tooling only after a real retained switch.

### Experiment 6: preview-only exclusion

- **Hypothesis:** teams will use agent-authored annotations more often if temporary
  content is provably absent from production.
- **Audience:** six teams that deploy frontend previews.
- **Artifact:** explicit module-boundary recipe with output inspection.
- **Channel:** the agent-handoff pilot.
- **Metric:** four successful integrations and no temporary content in inspected
  production outputs.
- **Time box:** three weeks.
- **Decision:** retain a Vite plugin only if it substantially reduces setup or
  errors compared with the plain recipe.

## 13. Release principles and gates

The first direction release is complete when it provides a coherent workflow, not
when every Rough Notation option has been copied.

### 13.1 Must ship

- **Release integrity:** A1 and A6.
- **Stable contracts:** A3 and A4.
- **Measured payloads:** A5, with provisional measurements after the motion
  prototype and final release budgets after required `box` support is integrated.
- **Motion foundation:** B1, B2, B4, B5, and B7. The minimum animated
  primitives are `circle`, `underline`, and the new `box`; static behavior remains
  available for every existing primitive. Unsupported reveal combinations must be
  rejected or omitted rather than silently doing the wrong thing.
- **One missing baseline primitive:** C1 (`box`). Other Rough Notation coverage is
  part of the direction but not a condition for this release.
- **Playwright delivery:** D1–D4, D6, and D7, including browser injection without
  application source edits.
- **Shipping control:** E1, E2, and E4. A plain explicit boundary is sufficient;
  no plugin is required.
- **Equal agent delivery:** F1, the motion portion of F2, F3, and F4.
- **Public first success:** G1 and G2 plus the complete D7 handoff example.
- **Release verification:** H2 and current compatibility, accessibility,
  placement, and injection limits.

Sequential presentation is possible in this cut by awaiting individual handles in
host code. A group helper and video-specific recipe improve ergonomics but do not
block the Playwright injection commitment.

### 13.2 Ship if ready, otherwise follow immediately

- Primitive-specific reveal for highlight, arrow, and sticky (B3).
- Public update APIs and mutable behavior beyond the internal nonreplaying updates
  required by A4/B7 (remaining B6 scope).
- Ordered group helper (B8).
- Bracket, strike-through, padding, multiline/RTL, and iterations (C2–C6).
- Ordered Playwright video recipe (D5).
- Fresh comparative agent trials (F5/F6).
- The broader example set (G3/G4).

### 13.3 Not required

- Universal compiler stripping.
- Hosted artifact sharing.
- Collaboration or identity.
- Browser extension or MCP server.
- Tour progression.
- Arbitrary animation timelines.
- Automatic target discovery across source and browser runtimes.
- Automatic QA or explanation generation.

### 13.4 Quality gates

- Narrow unit tests for new state and geometry behavior.
- Browser tests for reveal, reduced motion, refresh without replay, and cleanup.
- Framework lifecycle and SSR/hydration checks.
- Packed-consumer tests for every new export.
- Generated capability/schema drift checks.
- Browser-bundle and npm-package size reporting.
- Output inspection for disabled and mixed builds.
- Manual visual review of each primitive's animation.
- Retained agent failures and corrected results kept separate.

## 14. Dependency-ordered backlog

Impact, confidence, and effort use High/Medium/Low. Effort is relative: Small is
up to roughly two focused days, Medium is several days to a week, and Large is
more than a week or crosses several toolchains. Estimates exclude waiting for
external pilot feedback.

### Now: establish contracts and release integrity

#### A1. Make public examples match the published package

- **Problem:** the deployed website can copy checkout-only placement options while
  advertising published `0.1.0`.
- **Proposed change:** build stable public examples from the released package and
  capability snapshot; isolate any next-version preview visibly.
- **User and workflow:** first-time visitor copying an example into an installed
  project.
- **Rationale:** a version mismatch blocks first success and invalidates adoption
  measurement.
- **Acceptance criteria:** every stable snippet compiles against the advertised
  version; stable runtime and capabilities agree; unreleased options cannot appear
  in copied stable output; version labels agree across site, README, and npm links.
- **Verification:** packed-consumer compile plus website build and targeted snippet
  assertions.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** none.
- **Purpose:** validates demand by removing a known conversion defect.

#### A2. Publish the Rough Notation behavior target

- **Problem:** “port as much as possible” can become an unbounded compatibility
  project.
- **Proposed change:** turn Section 5 into a versioned capability checklist with
  present, planned, equivalent, and intentionally excluded states.
- **User and workflow:** adopter comparing libraries; contributor selecting work.
- **Rationale:** behavioral parity is useful; accidental API cloning is not.
- **Acceptance criteria:** every public Rough Notation capability has a disposition;
  equivalence claims have examples; drop-in compatibility is explicitly denied.
- **Verification:** documentation review against Rough Notation's current README
  and source.
- **Impact / confidence / effort:** High / High / Small.
- **Dependencies:** none.
- **Purpose:** validates switching demand and controls scope.

#### A3. Decide the visibility and animation lifecycle

- **Problem:** show, hide, replay, completion, and interruption affect every
  primitive and adapter.
- **Proposed change:** write an API decision record with state transitions,
  reduced-motion behavior, completion, cancellation, and error semantics.
- **User and workflow:** developer or agent sequencing annotations.
- **Rationale:** adding CSS before defining state would create incompatible behavior.
- **Acceptance criteria:** initial visibility; repeated calls; hide/destroy during
  reveal; offscreen targets; refresh; resketch; and reduced motion all have one
  deterministic outcome.
- **Verification:** executable state-table test plan accompanies the record.
- **Impact / confidence / effort:** High / High / Small.
- **Dependencies:** none.
- **Purpose:** enables the first release safely.

#### A4. Decide framework visibility and update ergonomics

- **Problem:** current adapters remount on option changes and expose no shared
  imperative animation control.
- **Proposed change:** define idiomatic React, Vue, Svelte, Angular, and vanilla
  examples using one core handle contract.
- **User and workflow:** framework developer toggling or replaying an annotation.
- **Rationale:** animation parity cannot be delegated to later adapter cleanup.
- **Acceptance criteria:** every framework can declaratively show/hide and
  imperatively sequence where appropriate; updates do not replay accidentally;
  no speculative framework abstraction is introduced.
- **Verification:** prototype compilation and lifecycle test design for each
  adapter.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** A3.
- **Purpose:** enables adoption across existing supported frameworks.

#### A5. Define size measurements and provisional budgets

- **Problem:** the current core is approximately 6.83 KiB against a 7 KiB budget,
  leaving no honest room for the direction.
- **Proposed change:** report a minimal primitive consumer, full core, CSS, and
  optional integrations separately; preserve provisional regression limits, then
  finalize them after the first motion prototype.
- **User and workflow:** developer evaluating production cost; maintainer reviewing
  regressions.
- **Rationale:** preserve tree-shaking instead of optimizing for one concatenated
  number.
- **Acceptance criteria:** measurement categories and provisional limits are
  reproducible in CI; optional Playwright/build code cannot enter browser-core
  bundles; B2 records any evidence-based final limit change.
- **Verification:** extend package bundle fixtures and size script.
- **Impact / confidence / effort:** Medium / High / Small.
- **Dependencies:** none; final thresholds follow B2.
- **Purpose:** scales trusted adoption.

#### A6. Clarify install, binary, ESM, CSS, and platform requirements

- **Problem:** scoped package installation, the `stet` binary, CSS import, ESM, and
  Node requirements are not always presented together.
- **Proposed change:** establish one canonical install sequence and reuse it across
  README, website, skills, and docs.
- **User and workflow:** new developer or agent initializing Stet.
- **Rationale:** remove preventable first-run ambiguity.
- **Acceptance criteria:** examples establish the scoped package before local CLI
  use; Node and client-only requirements are visible; package consumers exercise
  the documented path.
- **Verification:** packed fresh-consumer test on supported Node versions.
- **Impact / confidence / effort:** High / High / Small.
- **Dependencies:** A1.
- **Purpose:** validates activation.

### Next: build the motion foundation

#### B1. Add explicit annotation visibility

- **Problem:** annotations cannot be hidden without destruction, and observer-owned
  visibility cannot represent user intent.
- **Proposed change:** add public visibility state while keeping intersection state
  separate.
- **User and workflow:** site, demo, presentation, or agent handoff toggling marks.
- **Rationale:** visibility is the foundation for reveal, replay, and sequencing.
- **Acceptance criteria:** explicit hiding survives intersection changes; showing
  remeasures; descriptions follow the agreed accessibility contract; existing
  immediate rendering stays the default.
- **Verification:** unit state test and browser scroll/description regression.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** A3.
- **Purpose:** delivers core first-release value.

#### B2. Add opt-in reveal for stroked primitives

- **Problem:** boil gives ambient movement but cannot direct attention through a
  finite entrance.
- **Proposed change:** implement the agreed reveal behavior for underline and
  circle first, then other compatible strokes.
- **User and workflow:** developer presenting or demonstrating an interface.
- **Rationale:** finite reveal is the central product expansion.
- **Acceptance criteria:** static default unchanged; duration and delay work;
  refresh/scroll/resize do not replay; reduced motion shows the final state
  immediately.
- **Verification:** one unit state test, browser animation test, and manual visual
  review.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** B1.
- **Purpose:** validates animation demand.

#### B3. Add primitive-appropriate highlight, arrow, and sticky reveal

- **Problem:** a generic outline animation produces poor results for filled marks,
  compound arrows, and text notes.
- **Proposed change:** add a marker sweep, intentional shaft/head order, and
  coherent note entrance.
- **User and workflow:** author explaining state, relationship, and meaning.
- **Rationale:** the differentiating primitives must not look like unfinished
  exceptions.
- **Acceptance criteria:** each treatment reaches a stable final state; labels and
  descriptions remain readable; no outline-only highlight; no layout ownership.
- **Verification:** targeted browser tests and approved visual references for each
  treatment.
- **Impact / confidence / effort:** High / Medium / Large.
- **Dependencies:** B2.
- **Purpose:** deepens demonstrated value.

#### B4. Add replay, completion, and cancellation

- **Problem:** consumers otherwise reproduce timing with fragile timeouts.
- **Proposed change:** implement the A3 completion contract and explicit replay.
- **User and workflow:** presenter, demo author, agent, or Playwright capture
  sequencing marks.
- **Rationale:** awaitable behavior is the main API modernization over Rough
  Notation.
- **Acceptance criteria:** completion settles exactly once; hide/destroy and
  interrupted replay never hang; reduced motion completes immediately; errors are
  actionable.
- **Verification:** state-machine unit test using fake events/time plus browser
  interruption case.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** B2.
- **Purpose:** enables sequencing and Playwright delivery.

#### B5. Compose reveal, boil, hover, and reduced motion

- **Problem:** independent motion mechanisms can flash variants, restart, or run
  forever during capture.
- **Proposed change:** define and implement one composition policy.
- **User and workflow:** animated live site and deterministic artifact capture.
- **Rationale:** animation polish is irrelevant if lifecycle behavior is unstable.
- **Acceptance criteria:** no variant flash; hover resketch does not replay;
  reduced-motion changes settle correctly; capture can reach a deterministic
  state.
- **Verification:** browser tests for live preference changes, hover, replay, and
  stable capture.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** B4.
- **Purpose:** retains users who adopt motion.

#### B6. Add only the stable update behavior animation requires

- **Problem:** adapter remounts can restart reveal and lose handle state.
- **Proposed change:** add a typed update path for proven mutable fields, or retain
  remounting where it has no harmful effect.
- **User and workflow:** framework application changing theme, note text, or
  visibility.
- **Rationale:** solve the concrete lifecycle problem without cloning mutable
  property setters.
- **Acceptance criteria:** supported updates preserve visibility and do not replay;
  unsupported structural changes are explicit; cleanup remains idempotent.
- **Verification:** adapter update tests and handle-state regression.
- **Impact / confidence / effort:** Medium / Medium / Medium.
- **Dependencies:** A4, B4.
- **Purpose:** scales reliable framework usage.

#### B7. Deliver framework parity for motion

- **Problem:** core-only motion would make the advertised adapters misleading.
- **Proposed change:** implement A4 for the first-release visibility/reveal contract
  across all current adapters and templates; later primitive treatments and update
  operations carry their own adapter changes.
- **User and workflow:** React, Vue, Svelte, Angular, and vanilla consumers.
- **Rationale:** the existing support promise includes those frameworks.
- **Acceptance criteria:** matching supported options and lifecycle outcomes;
  StrictMode, reactive updates, action/directive cleanup, and hydration still pass.
- **Verification:** existing adapter, pattern, browser, and SSR suites extended
  narrowly.
- **Impact / confidence / effort:** High / High / Large.
- **Dependencies:** B1, B2, B4, B5.
- **Purpose:** scales the first-release capability.

#### B8. Add ordered annotation groups

- **Problem:** presentations and demonstrations need sequencing without manual
  duration arithmetic.
- **Proposed change:** add a small coordinator over stable handles.
- **User and workflow:** author revealing several annotations in order.
- **Rationale:** this is a common annotation behavior and a direct beneficiary of
  awaitable completion.
- **Acceptance criteria:** ordered reveal, hide/reset, replay, cancellation, and
  cleanup; host app still owns slides, navigation, and progression.
- **Verification:** deterministic order/cancellation unit test and one browser demo.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** B4, B7.
- **Purpose:** validates presentation and demonstration demand.

### Next: complete useful Rough Notation coverage

#### C1. Add `box`

- **Problem:** rectangular controls, cards, and regions lack a familiar annotation.
- **Proposed change:** add seeded rough-box geometry and named exports/adapters.
- **User and workflow:** author emphasizing a bounded UI region.
- **Rationale:** common migration and presentation primitive.
- **Acceptance criteria:** padding, reveal, refresh, descriptions, generated
  capabilities, all adapters, and tree-shaking work.
- **Verification:** geometry/unit, browser visual, adapter, packed-consumer, and
  generated-drift checks.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** B2, B7.
- **Purpose:** validates migration demand.

#### C2. Add `bracket`

- **Problem:** explanatory prose and grouped regions benefit from side-specific
  grouping without a full box.
- **Proposed change:** add bracket geometry with selected top/right/bottom/left
  sides.
- **User and workflow:** documentation and presentation author grouping content.
- **Rationale:** useful expressive behavior not covered by current primitives.
- **Acceptance criteria:** one or more validated sides; deterministic reveal;
  padding and wrapped-content behavior; adapter and agent parity.
- **Verification:** invalid-input test, directional visual references, browser
  lifecycle, and template compilation.
- **Impact / confidence / effort:** Medium / Medium / Medium.
- **Dependencies:** B2, B7, C4.
- **Purpose:** deepens demonstrated value.

#### C3. Add `strikeThrough` and document crossed-off behavior

- **Problem:** correction, before/after, and rejected-choice examples lack a clear
  strike primitive.
- **Proposed change:** add strike-through and document how existing wrong marks map
  to crossed-off behavior.
- **User and workflow:** author showing deprecated or incorrect content.
- **Rationale:** common annotation vocabulary with little need for new architecture.
- **Acceptance criteria:** wrapped-text behavior defined; reveal direction works;
  `mark("wrong")` compatibility differences are explicit.
- **Verification:** multiline/RTL visual and adapter tests.
- **Impact / confidence / effort:** Medium / High / Small–Medium.
- **Dependencies:** B2, B7. C5 expands its text-direction coverage but does not
  block the basic primitive.
- **Purpose:** scales primitive usefulness.

#### C4. Add CSS-like per-side padding

- **Problem:** scalar padding cannot fit asymmetric labels and layout edges.
- **Proposed change:** accept documented CSS-like shorthand and normalize once in
  shared geometry code for primitives where padding already has defined meaning;
  decide highlight wash geometry separately rather than implying its current
  overlay padding already controls the wash edges.
- **User and workflow:** author fitting marks around real content.
- **Rationale:** common usability improvement with shared implementation.
- **Acceptance criteria:** supported scalar and shorthand forms are typed and
  validated; negative/invalid values have explicit behavior; existing scalar
  output is unchanged.
- **Verification:** one normalization unit table and representative visuals.
- **Impact / confidence / effort:** Medium / High / Small.
- **Dependencies:** none.
- **Purpose:** scales proven placement needs.

#### C5. Specify multiline and RTL behavior

- **Problem:** current line splitting is implicit and drawing direction is not
  configurable.
- **Proposed change:** define supported text elements, multiline choice, RTL reveal,
  and unsupported writing modes before adding options.
- **User and workflow:** documentation author annotating wrapped/localized text.
- **Rationale:** behavior should follow actual layout, not a copied boolean alone.
- **Acceptance criteria:** LTR/RTL and single/multiline examples; direction affects
  reveal intentionally; unsupported vertical writing is documented.
- **Verification:** browser fixtures for wrapping, mixed inline text, and RTL.
- **Impact / confidence / effort:** Medium / Medium / Medium.
- **Dependencies:** B2.
- **Purpose:** scales international and documentation use.

#### C6. Add configurable iterations

- **Problem:** authors may want one or several pen passes independent of boil.
- **Proposed change:** add bounded deterministic stroke iterations to compatible
  primitives.
- **User and workflow:** author tuning appearance and reveal.
- **Rationale:** closes a familiar capability gap while preserving deterministic
  output.
- **Acceptance criteria:** iterations are distinct from boil variants; input is
  bounded; animation timing is defined; bundle and DOM cost are measured.
- **Verification:** deterministic geometry test, visual references, and size report.
- **Impact / confidence / effort:** Low–Medium / Medium / Medium.
- **Dependencies:** B5 and evidence from animation pilots.
- **Purpose:** scales proven customization; may move after release.

#### C7. Publish an honest Rough Notation migration guide

- **Problem:** potential switchers cannot evaluate API and behavior differences.
- **Proposed change:** provide side-by-side released examples and a concise mapping.
- **User and workflow:** existing Rough Notation consumer evaluating Stet.
- **Rationale:** reach an established category instead of inventing search demand.
- **Acceptance criteria:** setup, primitive, animation, grouping, updates, bundle,
  accessibility, and limitations compared without unsupported superiority claims.
- **Verification:** every snippet compiles against published packages.
- **Impact / confidence / effort:** Medium / Medium / Medium.
- **Dependencies:** released subset of C1–C6.
- **Purpose:** validates and then scales switching demand.

### First direction release: Playwright delivery

#### D1. Define browser-injection support and ownership

- **Problem:** injection spans package, browser, document, frame, navigation, and
  cleanup boundaries.
- **Proposed change:** write the support contract and minimal API decision record.
- **User and workflow:** Playwright user or agent adding temporary annotations.
- **Rationale:** injection failures can pollute pages or create misleading artifacts.
- **Acceptance criteria:** browser/document/frame/CSP behavior, error handling,
  target lifetime, ownership, and cleanup are explicit.
- **Verification:** acceptance fixture matrix accompanies the decision.
- **Impact / confidence / effort:** High / High / Small.
- **Dependencies:** A3.
- **Purpose:** enables first-release agentic delivery.

#### D2. Implement optional Playwright browser injection

- **Problem:** temporary handoffs currently require application source changes.
- **Proposed change:** provide a recipe or optional entry point that injects the
  released browser runtime/CSS and resolves supplied Playwright locators.
- **User and workflow:** agent or developer annotating a running preview for capture.
- **Rationale:** source-free delivery materially broadens legitimate use.
- **Acceptance criteria:** no app source edits; actionable missing/multiple-target
  errors; no core Playwright dependency; types and packaging work in a fresh
  consumer.
- **Verification:** packed Playwright consumer against a local fixture in supported
  engines.
- **Impact / confidence / effort:** High / Medium / Large.
- **Dependencies:** D1, B4.
- **Purpose:** validates the agent and Playwright wedge.

#### D3. Add scoped cleanup and navigation behavior

- **Problem:** injected annotations must not remove application-authored marks or
  leak after navigation/failure.
- **Proposed change:** assign integration ownership and expose idempotent cleanup.
- **User and workflow:** test creating several temporary annotation sets.
- **Rationale:** safe teardown is mandatory for browser tooling.
- **Acceptance criteria:** cleanup removes only owned overlays/descriptions/listeners;
  application-authored Stet remains; navigation and test failure leave no retained
  page state.
- **Verification:** mixed ownership and navigation browser tests.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** D2.
- **Purpose:** retains integration users.

#### D4. Publish deterministic screenshot capture

- **Problem:** animation, fonts, random geometry, and responsive state can make
  artifacts unstable.
- **Proposed change:** provide a canonical source-authored and injected screenshot
  recipe.
- **User and workflow:** developer or agent attaching an annotated screenshot to a
  release or review.
- **Rationale:** use Playwright's existing capture rather than building export.
- **Acceptance criteria:** explicit viewport/state; stable seed; fonts ready;
  finite reveal complete; boil controlled; plain-text context included.
- **Verification:** repeat capture has stable expected output on the supported CI
  platform.
- **Impact / confidence / effort:** High / High / Small–Medium.
- **Dependencies:** B4, D2. The first recipe disables boil; B5 later broadens
  deterministic capture while ambient motion is enabled.
- **Purpose:** validates artifact sharing.

#### D5. Publish ordered video and presentation capture

- **Problem:** authors need to record intentional reveal order without duplicating
  timing values.
- **Proposed change:** demonstrate Playwright recording controlled by handle/group
  completion.
- **User and workflow:** release-demo or presentation author.
- **Rationale:** shows the value of finite motion and ordered groups together.
- **Acceptance criteria:** recording uses public APIs; no arbitrary sleeps for Stet
  completion; reduced-motion capture alternative documented.
- **Verification:** generated recording plus deterministic event-order assertion.
- **Impact / confidence / effort:** Medium / Medium / Medium.
- **Dependencies:** B8, D2.
- **Purpose:** validates demonstrative and presentational demand.

#### D6. Publish independent behavior verification

- **Problem:** attractive annotations can conceal broken native behavior or imply a
  check that never ran.
- **Proposed change:** extract a minimal consumer recipe from existing verification
  fixtures.
- **User and workflow:** developer or agent claiming an annotated handoff is usable.
- **Rationale:** verification is part of credible delivery.
- **Acceptance criteria:** check focus, typing, submission, control identity,
  descriptions, pointer transparency, layout, and cleanup separately from visual
  presence.
- **Verification:** runnable `@playwright/test` example in a packed consumer.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** D3.
- **Purpose:** scales trusted use.

#### D7. Produce one complete portable handoff artifact

- **Problem:** plans and screenshots alone do not show the intended end-to-end
  delivery.
- **Proposed change:** publish an example containing preview/state metadata,
  annotation plan, screenshot/video, explanation, checks, and uncertainty.
- **User and workflow:** reviewer inspecting an agent-authored UI change.
- **Rationale:** demonstrate the product outcome rather than the tooling pieces.
- **Acceptance criteria:** generated from public APIs; no claim that Stet ran the
  agent or QA; source-authored and injected variants compared honestly.
- **Verification:** another developer can reproduce it from documented commands.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** D4, D6, and F3. The video recipe in D5 is not required.
- **Purpose:** validates agentic delivery and provides distribution.

### First direction release: shipping control

#### E1. Document production, preview, local, and mixed boundaries

- **Problem:** “strip Stet in production” conflicts with intentional production
  annotations and does not define content removal.
- **Proposed change:** publish one explicit annotation-module pattern for each mode.
- **User and workflow:** application deciding what belongs in customer builds.
- **Rationale:** shipping policy must be a user choice.
- **Acceptance criteria:** each mode has a minimal framework example; disabled,
  runtime-excluded, and content-excluded guarantees are distinguished.
- **Verification:** examples compile and output expectations are stated.
- **Impact / confidence / effort:** High / High / Small.
- **Dependencies:** A4.
- **Purpose:** validates preview-only demand.

#### E2. Add compile-time exclusion recipes

- **Problem:** runtime no-ops can leave temporary copy and imports in production.
- **Proposed change:** implement explicit review-only modules selected through
  compile-time constants/import boundaries.
- **User and workflow:** team deploying annotations to previews but not production.
- **Rationale:** let normal bundlers remove content without source rewriting.
- **Acceptance criteria:** enabled preview renders; disabled output contains no
  temporary text, plan, Stet runtime, or CSS when otherwise unused; mixed mode
  retains production marks.
- **Verification:** output inspection in fresh Vite consumers.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** E1.
- **Purpose:** validates agentic preview adoption.

### Later: evaluate build-tool convenience after the plain recipe

#### E3. Prototype a bounded Vite integration

- **Problem:** repeated manual boundary configuration may be an adoption obstacle.
- **Proposed change:** prototype a plugin that configures explicit supported
  boundaries and reports what was excluded.
- **User and workflow:** Vite application using preview-only annotations.
- **Rationale:** test convenience without committing to universal compiler work.
- **Acceptance criteria:** no arbitrary JSX/SFC/template rewriting; plain recipe
  remains possible; output equals E2; plugin retained only after user comparison.
- **Verification:** enabled, disabled, and mixed fixture builds plus pilot feedback.
- **Impact / confidence / effort:** Medium / Low–Medium / Medium.
- **Dependencies:** E2 and demand experiment 6.
- **Purpose:** validates demand; not a release blocker if the recipe wins.

### First direction release: prove shipping guarantees

#### E4. Gate exclusion claims with output tests

- **Problem:** configuration can appear disabled while leaving reachable chunks or
  private annotation content.
- **Proposed change:** inspect generated JavaScript, CSS, assets, and module graphs in
  consumer fixtures.
- **User and workflow:** maintainer making a production-exclusion guarantee.
- **Rationale:** build output, not intent, determines what ships.
- **Acceptance criteria:** CI covers enabled, disabled, and mixed cases; temporary
  sentinel content is absent; intentional marks remain in mixed mode.
- **Verification:** automated artifact scan and runtime smoke test.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** E2; E3 if shipped.
- **Purpose:** scales trusted adoption.

### Cross-cutting: keep agent delivery complete

#### F1. Extend generated contracts with every released capability

- **Problem:** runtime, capabilities, schemas, types, and templates can drift.
- **Proposed change:** update the existing generator catalog as each B/C feature
  lands.
- **User and workflow:** coding agent inspecting installed facts.
- **Rationale:** generated installed-version truth is a substantive Stet advantage.
- **Acceptance criteria:** new primitives/options are represented; unsupported
  temporal orchestration is not fabricated; `agent:check` passes.
- **Verification:** existing drift, schema, template, and package tests.
- **Impact / confidence / effort:** High / High / Small per capability.
- **Dependencies:** corresponding runtime work.
- **Purpose:** scales agent adoption.

#### F2. Add canonical motion and group recipes

- **Problem:** agents may invent lifecycle methods or coordinate with arbitrary
  sleeps.
- **Proposed change:** generate canonical static, reveal, and replay examples for
  supported frameworks; add ordered-group examples only if B8 ships.
- **User and workflow:** coding agent implementing a demo or presentation.
- **Rationale:** keep temporal behavior grounded in the public API.
- **Acceptance criteria:** examples compile; reduced-motion and cleanup guidance
  included; sequential host-code example uses handle completion; no timeline
  schema introduced.
- **Verification:** template compile matrix and browser lifecycle case.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** B7, F1. B8 is required only for group-helper examples.
- **Purpose:** scales agentic authoring.

#### F3. Teach source-authored versus injected delivery

- **Problem:** agents need to choose lifetime and ownership rather than always edit
  source.
- **Proposed change:** update entry and use-case skills with a bounded delivery
  decision and both workflows.
- **User and workflow:** agent responding to “explain this UI change.”
- **Rationale:** makes Playwright injection a first-class delivery path without a
  second product.
- **Acceptance criteria:** durable/published intent selects source; temporary
  artifact intent selects injection; ambiguous intent is surfaced; generated
  output states limits.
- **Verification:** positive, negative, and ambiguous routing/task fixtures.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** D2, E1.
- **Purpose:** validates agentic delivery.

#### F4. Teach production and review boundaries

- **Problem:** an agent may scatter temporary review copy through shipping source.
- **Proposed change:** add explicit placement and output-verification guidance to
  relevant skills.
- **User and workflow:** agent implementing preview-only annotations.
- **Rationale:** build exclusion depends on source ownership discipline.
- **Acceptance criteria:** task examples put temporary work inside the supported
  boundary; agent verifies output rather than merely setting an environment flag.
- **Verification:** prepared application build with sentinel-content scan.
- **Impact / confidence / effort:** High / Medium / Small–Medium.
- **Dependencies:** E2, E4.
- **Purpose:** scales safe agent usage.

#### F5. Run fresh source and injection trials

- **Problem:** current trials do not evaluate new motion, injection, or shipping
  choices.
- **Proposed change:** run matched tasks with retained initial outputs, corrections,
  browser evidence, and ordinary-tool baselines.
- **User and workflow:** maintainer evaluating whether skills improve delivery.
- **Rationale:** test the actual first-release thesis.
- **Acceptance criteria:** tasks cover source and injected paths; matched output
  requirements; initial failures retained; truthfulness, interaction, placement,
  and build output scored separately.
- **Verification:** model-free replay plus independently reviewed raw artifacts.
- **Impact / confidence / effort:** High / Medium / Large.
- **Dependencies:** F2–F4, D7.
- **Purpose:** validates agent differentiation.

#### F6. Publish a scoped evaluation summary

- **Problem:** routing and final pass counts can be mistaken for general agent
  performance.
- **Proposed change:** publish outcomes with sample, model, prompt, correction cost,
  baseline, and review limits.
- **User and workflow:** adopter deciding whether to trust agent guidance.
- **Rationale:** transparent limits are a trust advantage.
- **Acceptance criteria:** forced-choice routing labeled accurately; fresh execution
  distinguished from replay; corrected results separate from first attempts; no QA
  claim follows from annotations.
- **Verification:** independent evidence-to-copy review.
- **Impact / confidence / effort:** Medium / High / Small.
- **Dependencies:** F5.
- **Purpose:** scales trust rather than raw demand.

### Adoption surface

#### G1. Reframe the homepage around live explanation

- **Problem:** visual identity and broad audiences appear before a recurring task.
- **Proposed change:** lead with one state-dependent interactive demonstration and
  the agreed category/value copy.
- **User and workflow:** developer deciding whether Stet solves a problem.
- **Rationale:** establish outcome before implementation mechanics.
- **Acceptance criteria:** brief user test identifies category, use, boundary, and
  next action; decorative gallery is secondary; stable examples use the release.
- **Verification:** website tests plus five-second comprehension sessions.
- **Impact / confidence / effort:** High / Medium / Medium.
- **Dependencies:** A1 and a stable B/C release subset.
- **Purpose:** validates positioning.

#### G2. Give developer and agent paths equal first success

- **Problem:** agent tooling can feel separate while the direct API path is spread
  across docs.
- **Proposed change:** provide parallel “Write it yourself” and “Ask your agent”
  starts that converge on the same example.
- **User and workflow:** new developer choosing an authoring method.
- **Rationale:** agentic delivery remains first-class without becoming a separate
  product.
- **Acceptance criteria:** both paths produce the same supported annotation; mobile
  CTA remains visible; direct quickstart includes cleanup and motion choice.
- **Verification:** mobile/keyboard browser test and fresh-user completion.
- **Impact / confidence / effort:** High / High / Medium.
- **Dependencies:** A6, F2.
- **Purpose:** validates both acquisition paths.

#### G3. Publish production, Storybook, presentation, and injection examples

- **Problem:** the breadth of legitimate destinations is currently asserted more
  than demonstrated.
- **Proposed change:** create four bounded examples by reusing existing fixtures and
  primitives.
- **User and workflow:** developer matching Stet to an existing environment.
- **Rationale:** examples distribute the library better than abstract claims.
- **Acceptance criteria:** real controls; reduced motion; released APIs; visible
  source; host owns progression; injection changes no source; each example states
  when a screenshot is simpler.
- **Verification:** packed builds and targeted Playwright checks.
- **Impact / confidence / effort:** High / Medium / Large.
- **Dependencies:** B8, D7, E2.
- **Purpose:** validates and scales adoption.

#### G4. Consolidate compatibility, limitations, and comparisons

- **Problem:** browser, layout, injection, accessibility, release, and build limits
  are fragmented.
- **Proposed change:** publish one linked compatibility/limits page and an honest
  alternatives section.
- **User and workflow:** evaluator qualifying Stet before installation.
- **Rationale:** appropriate self-selection reduces failed adoption.
- **Acceptance criteria:** unsupported document/layout contexts; animation/reduced
  motion; Playwright/CSP; ESM/framework versions; shipping guarantees; screenshot,
  Rough Notation, tours, and feedback-tool boundaries are covered.
- **Verification:** claims traced to tests or explicitly labeled limitations.
- **Impact / confidence / effort:** Medium / High / Medium.
- **Dependencies:** final A–F contracts.
- **Purpose:** scales trustworthy adoption.

#### G5. Add privacy-respecting funnel measurement

- **Problem:** current website events do not show the path to first success.
- **Proposed change:** add aggregate GitHub, install, starter, playground-copy,
  framework, and agent-guide events without content collection.
- **User and workflow:** maintainer diagnosing conversion friction.
- **Rationale:** distinguish awareness from attempted activation.
- **Acceptance criteria:** no copied code, selectors, annotation text, or form data;
  local traffic excluded; event definitions documented; runtime remains telemetry
  free.
- **Verification:** production-only event unit checks and privacy review.
- **Impact / confidence / effort:** Medium / High / Small.
- **Dependencies:** G1, G2 event locations.
- **Purpose:** validates demand.

#### G6. Open contribution and example pathways

- **Problem:** adopters lack a clear route to submit real examples or bounded
  regressions.
- **Proposed change:** add accurate GitHub topics, example/reproduction templates,
  and a small set of contribution-ready issues.
- **User and workflow:** adopter reporting friction or contributing a use case.
- **Rationale:** external artifacts and regressions are more meaningful than stars.
- **Acceptance criteria:** templates request versions, reproduction, expected
  behavior, and permission for examples; no generic “help wanted” placeholders.
- **Verification:** dry-run a complete issue from the template.
- **Impact / confidence / effort:** Medium / Medium / Small.
- **Dependencies:** G3 for exemplar.
- **Purpose:** scales community participation.

### Evidence gates

#### H1. Run adoption and comparison experiments

- **Problem:** implementation quality does not establish recurring demand.
- **Proposed change:** execute the six experiments in Section 12 with qualified
  external users.
- **User and workflow:** maintainer deciding what to continue.
- **Rationale:** the next milestone is repeated use, not another capability.
- **Acceptance criteria:** participants, task, artifact, first success, rejection,
  retention, and second use recorded with consent; thresholds applied as written.
- **Verification:** evidence ledger and follow-up dates.
- **Impact / confidence / effort:** High / High for learning / Large.
- **Dependencies:** relevant G examples and release candidates.
- **Purpose:** validates demand.

#### H2. Complete the first-release consumer matrix

- **Problem:** new motion, frameworks, injection, and exclusion cross several
  toolchains.
- **Proposed change:** run the narrow test for each item and the full release matrix
  before publication.
- **User and workflow:** every consumer installing the first direction release.
- **Rationale:** lazy code without its check is unfinished.
- **Acceptance criteria:** unit, browser, adapter, SSR/hydration, packed consumer,
  schema/template, size, output exclusion, and manual visual review pass; failures
  are not hidden by final reruns.
- **Verification:** release evidence links exact commands and artifacts.
- **Impact / confidence / effort:** High / High / Large.
- **Dependencies:** required first-release A–G items.
- **Purpose:** scales proven behavior.

## 15. Suggested implementation sequence

The dependency order is more important than parallel feature count:

1. **Integrity:** A1, A2, A6.
2. **Contracts:** A3, A4, D1, E1; establish A5 measurements and
   provisional budgets in parallel.
3. **Minimum motion:** B1 and B2.
4. **Early evidence:** run the live-versus-screenshot experiment on the B2
   prototype before committing to every primitive-specific treatment.
5. **Awaitable delivery:** B4, then D2 and D3. Injection does not wait for new
   primitives, ordered groups, or every advanced animation.
6. **Safe shipping:** E2 and E4 plus F3/F4; evaluate E3 separately.
7. **First-release completeness:** B5, B7, C1, D4, D6, D7, and F1/F2 as each
   public capability lands.
8. **Public first success:** G1 and G2, then H2.
9. **Immediate follow-ons:** B3, B6, B8, D5, C2–C5, and broader G examples,
   ordered by pilot evidence.
10. **Demand and evaluation:** H1 and matched F5/F6 trials; scale only the paths
    that users repeat.

C6, additional migration tooling, and any richer build integration can move after
the first direction release if they do not strengthen its demonstrated workflows.

## 16. 30/60/90-day adoption plan after release readiness

### Days 1–30

- Fix release/site parity and ship the first-success paths.
- Publish the production, Storybook, presentation, and injection examples.
- Recruit qualified pilot users rather than a broad undifferentiated audience.
- Run the screenshot/live and source/injection comparisons.
- Record every installation failure and second use.

Desired evidence: eight external projects complete a real workflow, four retain
annotations or artifacts, two use Stet on a second task, and users identify
benefits beyond appearance. These are the same participants used across the
experiments where qualified, not additive recruitment targets.

### Days 31–60

- Fix only blockers reproduced in real projects.
- Publish two external examples with permission.
- Improve the channel and framework path that produced retained use.
- Run Rough Notation migration evaluations.
- Follow up on second-task use.

Desired evidence: ten activated projects, five repeated-use projects, two public
external examples, and at least one meaningful external contribution or
reproduction.

### Days 61–90

- Scale the acquisition path that produces retained use.
- Decide whether source-authored and injected delivery both deserve equal billing.
- Add another framework starter only after requests and a willing verifier.
- Set API stability priorities from actual consumer code.
- Enter maintenance mode rather than adding categories if retention is absent.

Desired evidence: roughly twenty independently identifiable adopting projects,
eight repeated-use projects, and several unsolicited issues, artifacts, or
contributions.

## 17. Continue, pivot, and stop criteria

### Continue the direction when

- Users complete and retain live annotations or injected artifacts.
- At least eight projects show second use within the first 90-day cohort.
- Users name comprehension, delivery, lifecycle, or review benefits beyond visual
  novelty.
- External examples appear without the maintainer authoring all of them.
- One channel repeatedly produces retained use.

### Keep both delivery paths when

- Source-authored annotations recur in durable websites/docs/presentations.
- Injected annotations recur in temporary reviews or captured artifacts.
- Users choose based on lifetime rather than one path merely duplicating the other.

If one path is consistently unnecessary, simplify positioning and maintenance
around the path users repeat.

### Pivot toward the runtime when

Users adopt primitives and motion but ignore plans and skills. Agent support can
remain optional authoring guidance without carrying the product story.

### Pivot toward artifact recipes when

Users value captured explanations but do not retain live annotation source. Keep
Stet as the renderer and let Playwright and existing systems own capture and
publishing.

### Do not pivot automatically into feedback SaaS when

Users ask for comments, assignment, identity, or recording. First determine
whether existing feedback tools already solve the requested job better.

### Stop expanding and enter maintenance mode when

After reaching approximately thirty qualified prospects and at least ten completed
trials:

- Fewer than three retain Stet.
- Nobody uses it a second time.
- Most prefer screenshot and prose after successfully trying both.
- Value is consistently described only as “looks nice.”
- The maintainer must create every artifact and integration.
- Required requests converge on building a collaboration or tour platform.

Low traffic alone is not a stopping signal. Repeated rejection after successful
activation is.

## 18. Sources and research limits

Primary sources accessed 2026-09-12:

- Stet repository and implementation: <https://github.com/funsaized/stet>
- Stet website: <https://www.stetkit.com/>
- Rough Notation repository and API: <https://github.com/rough-stuff/rough-notation>
- Rough Notation SPA lifecycle issue:
  <https://github.com/rough-stuff/rough-notation/issues/86>
- Storybook testing documentation: <https://storybook.js.org/docs/writing-tests>
- Chromatic UI Review: <https://www.chromatic.com/features/review>
- Agentation: <https://agentation.com/>
- Agentation preview source-attribution request:
  <https://github.com/benjitaylor/agentation/issues/198>
- Playwright CLI: <https://github.com/microsoft/playwright-cli>
- Playwright MCP: <https://github.com/microsoft/playwright-mcp>
- Excalidraw: <https://github.com/excalidraw/excalidraw>

This direction is based on repository inspection, public product evidence, public
issues, and market comparisons. It is not based on private analytics, user
interviews, independent accessibility certification, or measured search volume.
Competitor stars, downloads, and vendor claims do not represent unique active
users. The backlog intentionally treats external retention as the evidence needed
to confirm or change the direction.
