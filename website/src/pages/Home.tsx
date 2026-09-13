import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Underline } from '@funsaized/stet/react';
import {
  REPO,
  INSTALL,
  AGENT_INIT,
  AGENT_PROMPT,
  LIFETIME_QUESTION,
  SAVE_SNIPPET,
} from '../constants';
import { Icon } from '../components/Icon';
import { CopyButton } from '../components/CopyButton';
import { Code } from '../components/Code';
import { HeroDemo } from '../components/HeroDemo';
import { Sketchbook } from '../components/Sketchbook';

export function Home() {
  const personality = useRef<HTMLElement>(null);
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-copy">
          <a className="release-pill" href="https://www.npmjs.com/package/@funsaized/stet/v/0.1.0">
            <span className="status-dot" /> Code-native annotation library <span>v0.1.0 ↗</span>
          </a>
          <h1>
            Explain the UI.
            <br />
            Keep it
            <br />
            <em ref={personality}>interactive.</em>
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
            For frontend developers and coding agents who need to explain a control’s state without
            turning the example into a screenshot. Attach hand-drawn marks to the live interface,
            then install and use the same API yourself or with your agent.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/" hash="install">
              Get started <Icon name="arrow" />
            </Link>
            <Link className="text-link" to="/docs">
              Read the docs <span>↗</span>
            </Link>
          </div>
          <CopyButton value={INSTALL} className="install-inline">
            <span className="dollar">$</span>
            <code>{INSTALL}</code>
          </CopyButton>
          <div className="hero-fineprint">
            Next action: try Save, then install. Open source. Zero runtime dependencies.
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
          <span className="eyebrow">02 / TWO EQUAL STARTS.</span>
          <h2>
            Write it yourself.
            <br />
            <em>Or ask your agent.</em>
          </h2>
          <p>
            Both paths attach the same circle and underline to the Save example, including CSS and
            cleanup. Leave <code>boil</code> at 0 to stay still, or set 0.3 for optional motion. If
            intended lifetime is unclear, ask: {LIFETIME_QUESTION} Durable work stays in source. The
            advertised 0.1.0 package does not include Playwright injection, so temporary artifact
            requests must stop rather than invent an import. Stet does not run a model, edit your
            app, apply a plan, or decide whether the UI passed.
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
          <div className="home-snippet mini-code">
            <div>
              <span>the same Save example</span>
              <CopyButton value={SAVE_SNIPPET} />
            </div>
            <Code text={SAVE_SNIPPET} />
          </div>
          <Link to="/docs" hash="quickstart" className="text-link">
            Choose your starting point <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="principle-grid">
          <article id="write">
            <span className="principle-icon">0</span>
            <h3>Write it yourself.</h3>
            <p>
              Install <code>@funsaized/stet@0.1.0</code>, import{' '}
              <code>@funsaized/stet/style.css</code>, attach the snippet’s circle and underline, and
              destroy the handles on cleanup. <code>boil: 0</code> stays still; <code>0.3</code> is
              optional motion. If intended lifetime is unclear, ask: {LIFETIME_QUESTION} If it
              should remain, keep it in source. If it is only a captured artifact, stop because the
              advertised 0.1.0 package does not export Playwright injection.
            </p>
            <Link to="/docs" hash="write" className="text-link">
              Write-path steps <Icon name="arrow" size={16} />
            </Link>
          </article>
          <article id="ask">
            <span className="principle-icon light">⌘</span>
            <h3>Ask your agent.</h3>
            <p>
              Same scoped install, then init project skills. Ask your agent for that Save circle and
              underline, including <code>@funsaized/stet/style.css</code>, destroy-on-cleanup, and
              still-versus-boil. If lifetime is unclear, ask: {LIFETIME_QUESTION} You inspect the
              live result; your tests check the app.
            </p>
            <div className="agent-command">
              <code>{AGENT_INIT}</code>
              <CopyButton value={AGENT_INIT} />
            </div>
            <CopyButton value={AGENT_PROMPT} className="agent-prompt-button">
              Copy the Save request
            </CopyButton>
            <Link to="/docs" hash="agents" className="text-link">
              Agent-path steps <Icon name="arrow" size={16} />
            </Link>
          </article>
          <article>
            <span className="principle-icon">□</span>
            <h3>Why not a screenshot?</h3>
            <p>
              Use a screenshot when a still image is enough. Use Stet when the explanation depends
              on typing, clicking, or changing state — as in Save above.
            </p>
          </article>
          <article>
            <span className="principle-icon light">≈</span>
            <h3>Motion stays optional.</h3>
            <p>
              Marks are still by default. Optional boil is ambient motion in this advertised
              release. Reduced-motion preferences stay still.
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
          coding agent can author an explanation against the installed contract, then hand off the
          live result and the checks that actually ran. Your app keeps its controls; Stet adds the
          marks.
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
