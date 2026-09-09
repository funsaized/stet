import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Underline } from '@funsaized/stet/react';
import { REPO, INSTALL } from '../constants';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { HeroDemo } from '../components/HeroDemo';
import { Sketchbook } from '../components/Sketchbook';
export function Home() {
  const personality = useRef<HTMLElement>(null);
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <a className="release-pill" href="https://www.npmjs.com/package/@funsaized/stet/v/0.1.0">
            <span className="status-dot" /> Fresh off the drawing board <span>v0.1.0 ↗</span>
          </a>
          <h1>
            A little ink.
            <br />A lot of
            <br />
            <em ref={personality}>clarity.</em>
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
            A UI annotation library for hand-sketched marks on live interfaces. Built for coding
            agents and developers, with project skills and a typed API that work on the controls you
            already have.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/use-cases">
              See Stet at work <Icon name="arrow" />
            </Link>
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
      <section id="install" className="principles section">
        <div className="principles-intro">
          <span className="eyebrow">02 / AGENT AND DEVELOPER FIRST.</span>
          <h2>
            Your agent. Your code.
            <br />
            <em>The same little marks.</em>
          </h2>
          <p>
            Install Stet, then add marks with your coding agent or write them yourself. Your UI
            keeps its layout, focus, and clicks.
          </p>
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
          <Link to="/docs" hash="quickstart" className="text-link">
            Choose your starting point <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="principle-grid">
          <article>
            <span className="principle-icon">⌘</span>
            <h3>Start with your agent.</h3>
            <p>
              Project skills guide annotation choices, validate plans, and provide examples for your
              framework. Supports Codex, Claude Code, Cursor, and OpenCode.
            </p>
          </article>
          <article>
            <span className="principle-icon light">0</span>
            <h3>Start with the API.</h3>
            <p>
              Typed primitives and framework adapters let you attach marks directly. The browser
              core has zero runtime dependencies.
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
      <section className="section use-case-teaser">
        <span className="eyebrow">WORKING UI / SHARED CONTEXT</span>
        <h2>
          Explain the risk.
          <br />
          <em>Show what changed.</em>
        </h2>
        <p>
          Use hand-drawn annotations in documentation, product demos and implementation reviews. A
          coding agent can turn a request into a validated plan and framework code, then visually
          hand off its work. Your app keeps its controls; Stet adds the marks.
        </p>
        <p>
          Product intent, UX critique and QE findings can point to the same interface. No accounts,
          comments service or collaboration platform required.
        </p>
        <div className="use-case-links">
          <Link className="button primary" to="/use-cases">
            Explore live use cases
          </Link>
          <Link className="button" to="/agent-workflow">
            Follow an agent workflow
          </Link>
        </div>
      </section>
      <Sketchbook />
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
