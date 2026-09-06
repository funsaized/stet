import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Underline } from '@funsaized/stet/react';
import { REPO, INSTALL } from '../constants';
import { usePageMeta } from '../usePageMeta';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { HeroDemo } from '../components/HeroDemo';
import { Playground } from '../components/Playground';
import { FrameworkCode } from '../components/FrameworkCode';
export function Home() {
  const personality = useRef<HTMLElement>(null);
  usePageMeta('stet — a little ink, a lot of personality', '/');
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <a className="release-pill" href="https://www.npmjs.com/package/@funsaized/stet/v/0.0.1">
            <span className="status-dot" /> Fresh off the drawing board <span>v0.0.1 ↗</span>
          </a>
          <h1>
            A little ink.
            <br />A lot of
            <br />
            <em ref={personality}>personality.</em>
          </h1>
          <Underline
            target={personality}
            stroke="#c84935"
            seed={8}
            padding={4}
            roughness={1.3}
            width={2.8}
          />
          <p className="hero-description">
            Hand-sketched annotations for the UI you already love. Circle the good stuff. Leave a
            little note. Make the internet feel human.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#playground">
              Make your mark <Icon name="arrow" />
            </a>
            <Link className="text-link" to="/docs">
              Read the docs <span>↗</span>
            </Link>
          </div>
          <CopyButton value={INSTALL} className="install-inline">
            <span className="dollar">$</span>
            <code>npm install @funsaized/stet</code>
          </CopyButton>
          <div className="hero-fineprint">
            Open source. Zero runtime dependencies. Yours to scribble with.
          </div>
        </div>
        <HeroDemo />
      </section>
      <div className="compatibility">
        <span>FITS RIGHT INTO YOUR WORLD</span>
        <div>
          <span>⚛︎ React</span>
          <span className="vue-framework">
            ∨ <b>Vue</b>
          </span>
          <span>
            <b className="svelte-letter">S</b> Svelte
          </span>
          <span>◇ Angular</span>
          <span>
            <b className="js-badge">JS</b> Vanilla JS
          </span>
        </div>
        <span className="handwritten">same ink, any canvas.</span>
      </div>
      <Playground />
      <section className="principles section">
        <div className="principles-intro">
          <span className="eyebrow">02 / GOOD MANNERS, BUILT IN</span>
          <h2>
            A guest in your UI.
            <br />
            <em>A very good guest.</em>
          </h2>
          <p>Stet adds a layer of character, without asking you to rebuild a thing.</p>
          <Link to="/docs" hash="how-it-works" className="text-link">
            A peek under the paper <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="principle-grid">
          <article>
            <span className="principle-icon">⌘</span>
            <h3>Your controls stay yours.</h3>
            <p>
              Real buttons. Real inputs. Same focus, clicks, and semantics. Just a little more
              character.
            </p>
          </article>
          <article>
            <span className="principle-icon light">0</span>
            <h3>Travels light.</h3>
            <p>
              No runtime dependencies in the core. Just a small toolkit of SVG marks, ready to make
              a point.
            </p>
          </article>
          <article>
            <span className="principle-icon">↔</span>
            <h3>Sticks with you.</h3>
            <p>
              Marks follow resizing, wrapped text, and scrolling. Life happens. The ink keeps up.
            </p>
          </article>
          <article>
            <span className="principle-icon light">≈</span>
            <h3>Knows when to be still.</h3>
            <p>
              Motion is optional. Reduced-motion preferences are respected. A quiet kind of playful.
            </p>
          </article>
        </div>
      </section>
      <section id="install" className="section install-section">
        <div className="install-copy">
          <span className="eyebrow">03 / FROM ZERO TO DOODLE</span>
          <h2>
            One install.
            <br />
            <em>Endless marginalia.</em>
          </h2>
          <p>Pick your framework. Pick something worth pointing out. Let Stet do the scribbling.</p>
          <CopyButton value={INSTALL} className="install-command">
            <span className="dollar">$</span>
            <code>{INSTALL}</code>
          </CopyButton>
          <div className="install-meta">
            <span>
              <Icon name="check" size={14} /> MIT licensed
            </span>
            <span>
              <Icon name="check" size={14} /> TypeScript ready
            </span>
          </div>
          <span className="handwritten install-note">
            No canvas. No new design system.
            <br />
            Just your interface, with feeling.
          </span>
        </div>
        <FrameworkCode />
      </section>
      <section className="closing">
        <span className="closing-star" aria-hidden="true">
          ✳︎
        </span>
        <span className="eyebrow">STET / LATIN, “LET IT STAND”</span>
        <h2>
          Not everything needs
          <br />
          to be{' '}
          <span>
            perfect.
            <svg viewBox="0 0 240 24" aria-hidden="true">
              <path d="M4 17Q114 2 235 11M9 22Q123 8 226 15" />
            </svg>
          </span>
        </h2>
        <p>Sometimes it just needs a little you.</p>
        <a href={REPO} className="button primary">
          <Icon name="github" /> Give Stet a home in your project <Icon name="arrow" size={17} />
        </a>
        <span className="handwritten closing-note">Made for the joy of making.</span>
      </section>
    </main>
  );
}
