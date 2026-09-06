import { Link } from '@tanstack/react-router';
import { REPO, INSTALL, kinds, descriptions } from '../constants';
import { usePageMeta } from '../usePageMeta';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { MarkGlyph } from '../components/MarkGlyph';
import { FrameworkCode } from '../components/FrameworkCode';
export function Docs() {
  usePageMeta('Get started with Stet — docs', '/docs');
  return (
    <main id="main" className="docs-layout">
      <aside className="docs-sidebar">
        <span className="eyebrow">THE FIELD GUIDE</span>
        <a href="#quickstart">Get started</a>
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
          <span className="eyebrow">STET v0.0.1 / DOCUMENTATION</span>
          <h1>
            Your first <em>little mark.</em>
          </h1>
          <p className="docs-lead">
            Stet draws on top of your existing interface. Start with a button, add a circle, and
            keep everything that already works.
          </p>
          <h2>1. Open the pencil case</h2>
          <CopyButton value={INSTALL} className="install-command">
            <code>{INSTALL}</code>
          </CopyButton>
          <p>
            Stet is ESM only. The core has no runtime dependencies; install your chosen framework
            separately. Version 0.0.1 is an initial release, so the examples pin the version.
          </p>
          <h2>2. Give something a little attention</h2>
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
