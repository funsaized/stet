import { frameworks } from '../frameworks';
import { Link } from '@tanstack/react-router';
import {
  REPO,
  INSTALL,
  AGENT_INIT,
  AGENT_PROMPT,
  LIFETIME_QUESTION,
  SAVE_SNIPPET,
  kinds,
  descriptions,
} from '../constants';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { Code } from '../components/Code';
import { MarkGlyph } from '../components/MarkGlyph';
import { FrameworkCode } from '../components/FrameworkCode';
export function Docs() {
  return (
    <main id="main" className="docs-layout">
      <aside className="docs-sidebar">
        <span className="eyebrow">THE FIELD GUIDE</span>
        <a href="#quickstart">Get started</a>
        <a href="#write">Write it yourself</a>
        <a href="#agents">Ask your agent</a>
        <a href="#developers">With the API</a>
        <a href="#how-it-works">How it works</a>
        <a href="#api">The six primitives</a>
        <a href="#options">Make it yours</a>
        <a href="#motion">Motion & accessibility</a>
        <a href={`${REPO}/blob/master/docs/reference.md`}>Full API reference ↗</a>
        <span className="handwritten">
          a few notes
          <br />
          on making marks.
        </span>
      </aside>
      <div className="docs-content">
        <section id="quickstart">
          <span className="eyebrow">STET v0.1.0 / DOCUMENTATION</span>
          <h1>
            Your first <em>little mark.</em>
          </h1>
          <p className="docs-lead">
            Built for coding agents and developers. Install Stet, then write the Save example
            yourself or ask your agent for the same circle and underline. Your existing UI keeps its
            controls and layout.
          </p>
          <h2>Install Stet</h2>
          <CopyButton value={INSTALL} className="install-command">
            <code>{INSTALL}</code>
          </CopyButton>
          <p>
            Stet is ESM only. The core has no runtime dependencies; install your chosen framework
            separately. Version 0.1.0 is an early release, so the examples pin the version. Both
            first-success paths below use this scoped install, import{' '}
            <code>@funsaized/stet/style.css</code>, destroy handles on cleanup, and keep marks still
            unless you opt into <code>boil: 0.3</code>.
          </p>
        </section>
        <section id="write">
          <h2>Write it yourself</h2>
          <p>
            Attach the homepage Save circle and underline in source. Import the stylesheet, destroy
            the handles on cleanup, and leave <code>boil</code> at 0 unless you want optional
            motion. If intended lifetime is unclear, ask: {LIFETIME_QUESTION} Durable or reusable
            explanations belong in source. The advertised 0.1.0 package does not export Playwright
            injection, so stop a temporary-artifact request rather than inventing a helper import.
          </p>
          <div className="home-snippet mini-code">
            <div>
              <span>the same Save example</span>
              <CopyButton value={SAVE_SNIPPET} />
            </div>
            <Code text={SAVE_SNIPPET} />
          </div>
          <p>
            <Link to="/">See the homepage Save circle and underline</Link>
          </p>
        </section>
        <section id="agents">
          <h2>Ask your agent</h2>
          <p>
            Same scoped install. Install Stet’s project skills from your app directory. The CLI
            requires Node.js 20 or newer. The <code>stet</code> binary comes from the installed{' '}
            <code>@funsaized/stet</code> package; use its local path below rather than fetching an
            unscoped package.
          </p>
          <CopyButton value={AGENT_INIT} className="install-command">
            <code>{AGENT_INIT}</code>
          </CopyButton>
          <p>
            Choose <code>codex</code>, <code>claude</code>, <code>cursor</code>, or{' '}
            <code>opencode</code> for your tool. Ask for the same Save result:
          </p>
          <blockquote>{AGENT_PROMPT}</blockquote>
          <p>
            You inspect the live circle and underline; your existing tests check the app. Stet does
            not run an agent, edit automatically, apply plans, or perform QA. If the explanation
            should remain in the application, the agent writes source. If it is only a captured
            artifact, stop: do not copy a Playwright helper that is not in the installed 0.1.0
            package.
          </p>
          <p>
            <Link to="/">See the homepage Save circle and underline</Link>
          </p>
          <p>
            After that first result, the agent can inspect installed capabilities, validate an
            annotation plan, and adapt a framework example. A valid plan cannot prove that a mark
            points to the right control or leaves text readable.
          </p>
          <a className="text-link" href={`${REPO}/blob/master/docs/agent-usage.md`}>
            Agent setup and workflow <Icon name="external" size={16} />
          </a>
        </section>
        <section id="developers">
          <h2>With the API</h2>
          <p>
            After the Save example, choose a framework for setup and cleanup. The first-success
            result stays the same circle and underline.
          </p>
          <ul>
            {frameworks.map((f) => (
              <li key={f.id}>
                <Link to={`/docs/${f.slug}`}>
                  {f.name} annotation guide: installation and lifecycle
                </Link>
              </li>
            ))}
          </ul>
          <FrameworkCode />
          <p>
            Always import the stylesheet. In React, annotation components render nothing and attach
            to a DOM ref after mount. The other adapters fit their framework’s native patterns.
          </p>
        </section>
        <section id="how-it-works">
          <h2>Your UI is still your UI.</h2>
          <p>
            Stet measures a target and adds a pointer-transparent SVG overlay. Your element keeps
            its layout, clicks, keyboard focus, and semantics. Notes use real HTML for readable
            text.
          </p>
          <p>
            Marks update on target and parent resize, viewport resize, and nested scrolling. With
            the vanilla API, call <code>refresh()</code> after application-driven movement that
            doesn’t resize the element, and <code>destroy()</code> before removing the target.
            Framework adapters handle cleanup for you.
          </p>
        </section>
        <section id="api">
          <span className="eyebrow">SIX PRIMITIVES. PLENTY TO SAY.</span>
          <h2>Meet the marks.</h2>
          <div className="api-list">
            {kinds.map((k) => (
              <article key={k}>
                <MarkGlyph kind={k} />
                <div>
                  <h3>
                    <code>
                      {k === 'arrow'
                        ? 'arrow(from, to, options)'
                        : k === 'mark'
                          ? 'mark(element, "right", options)'
                          : `${k}(element, options)`}
                    </code>
                  </h3>
                  <p>{descriptions[k][1]}</p>
                  {k === 'sticky' && (
                    <p>
                      Requires <code>text</code>. Choose a preferred <code>side</code>: auto, top,
                      right, bottom, or left.
                    </p>
                  )}
                  {k === 'mark' && (
                    <p>
                      Use <code>"right"</code> for a check or <code>"wrong"</code> for a cross.
                    </p>
                  )}
                  {k === 'arrow' && (
                    <p>
                      Both endpoints must be real elements. Add <code>label</code> and adjust{' '}
                      <code>curvature</code> to shape the connection.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="options">
          <h2>Make the ink your own.</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Option</th>
                  <th>What it does</th>
                  <th>Default</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['stroke', 'Ink color for strokes', 'CSS token'],
                  ['fill', 'Highlight or sticky paper color', 'CSS token'],
                  ['width', 'Stroke width in pixels', '2.2'],
                  ['roughness', 'How imperfect the sketch feels', '1'],
                  ['seed', 'Repeatable geometry', 'Random'],
                  ['boil', 'Optional frame variation', '0'],
                  ['resketchOnHover', 'Fresh marks on pointer entry and press', 'false'],
                  ['description', 'Accessible meaning for a mark', 'None'],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i}>{i === 0 ? <code>{cell}</code> : cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Set defaults with CSS custom properties such as <code>--stet-stroke</code>,{' '}
            <code>--stet-fill</code>, and <code>--stet-paper</code>. Framework option changes
            reattach the annotation. In vanilla, destroy and reattach to change options.
          </p>
        </section>
        <section id="motion">
          <h2>A thoughtful kind of playful.</h2>
          <p>
            Stet is still by default. Set <code>boil: 0.3</code> for subtle living ink, or enable{' '}
            <code>resketchOnHover</code>. Both honor reduced-motion preferences, including changes
            while the page is open.
          </p>
          <p>
            Decorative marks don’t create tab stops or intercept pointer events. When a mark
            communicates meaning, give it a <code>description</code>; don’t rely on color alone.
            Sticky text and arrow labels describe their targets automatically.
          </p>
          <p>
            Stet requires modern browser DOM APIs, including ResizeObserver. Arbitrary transforms,
            top-layer dialogs, and cross-document targets have placement limits. Read the complete
            reference before adding marks to complex layouts.
          </p>
          <a className="button primary" href={`${REPO}/blob/master/docs/reference.md`}>
            Read the full API reference <Icon name="external" size={16} />
          </a>
        </section>
        <Link className="text-link" to="/playground">
          ← Back to the pencil case
        </Link>
      </div>
    </main>
  );
}
