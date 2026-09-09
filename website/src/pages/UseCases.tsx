import { useState } from 'react';
import { Link, useMatch } from '@tanstack/react-router';
import {
  scenarios,
  perspectives,
  workspacePlans,
  tutorialPlans,
  reviewErrorPlan,
  fixedReviewPlan,
  securityPlan,
  type Perspective,
  type Scenario,
} from '../showcase/scenarios';
import { Workspace } from '../showcase/Workspace';
import { Security } from '../showcase/Security';
import { TeamExamples } from '../showcase/TeamExamples';
import { Deployment } from '../showcase/Deployment';
import { Activity } from '../showcase/Activity';
import { Release } from '../showcase/Release';
import { Artifacts } from '../showcase/Artifacts';
import '../showcase/showcase.css';

function ScenarioView({ scenario }: { scenario: Scenario }) {
  const [enabled, setEnabled] = useState(true);
  const [perspective, setPerspective] = useState<Perspective>('explain');
  const [step, setStep] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const isWorkspace = scenario.surface === 'workspace';
  const current = perspectives.find((p) => p.id === perspective)!;
  const plan = isWorkspace
    ? perspective === 'handoff'
      ? securityPlan
      : workspacePlans[perspective]
    : scenario.surface === 'tutorial'
      ? tutorialPlans[step]
      : scenario.surface === 'review' && fixed
        ? fixedReviewPlan
        : scenario.surface === 'review' && invalid
          ? reviewErrorPlan
          : scenario.plan;
  return (
    <article className="scenario-view">
      <div className="scenario-heading">
        <span className="eyebrow">{scenario.roles}</span>
        <h2>{scenario.title}</h2>
        <p>{scenario.subtitle}</p>
      </div>
      {isWorkspace && (
        <div className="perspective-strip" aria-label="Delivery perspectives">
          {perspectives.map((p, i) => (
            <button
              key={p.id}
              aria-pressed={perspective === p.id}
              onClick={() => setPerspective(p.id)}
            >
              <small>{i === 0 ? 'START' : `0${i}`}</small>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="scenario-story">
        <span className="eyebrow">{isWorkspace ? current.inputLabel : scenario.inputLabel}</span>
        <blockquote>{isWorkspace ? current.input : scenario.input}</blockquote>
      </div>
      <div className="live-toolbar">
        <span>
          <i /> LIVE APPLICATION · TRY THE CONTROLS
        </span>
        <button aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
          {enabled ? 'Annotations on' : 'Annotations off'}
        </button>
      </div>
      {scenario.surface === 'tutorial' && (
        <div className="lesson-steps" aria-label="Tutorial steps">
          {['Select branch', 'Choose environment', 'Deploy'].map((label, i) => (
            <button key={label} aria-pressed={step === i} onClick={() => setStep(i)}>
              {i + 1}. {label}
            </button>
          ))}
        </div>
      )}
      {scenario.surface === 'review' && (
        <div className="lesson-steps" aria-label="Review version">
          {[false, true].map((value) => (
            <button
              key={String(value)}
              aria-pressed={fixed === value}
              onClick={() => {
                setFixed(value);
                setInvalid(false);
              }}
            >
              {value ? 'Fixed' : 'Buggy'}
            </button>
          ))}
        </div>
      )}
      <div className="live-stage">
        {isWorkspace ? (
          perspective === 'explain' ? (
            <Workspace enabled={enabled} perspective={perspective} />
          ) : perspective === 'handoff' ? (
            <Security enabled={enabled} />
          ) : (
            <TeamExamples key={perspective} enabled={enabled} perspective={perspective} />
          )
        ) : scenario.surface === 'security' ? (
          <Security enabled={enabled} />
        ) : scenario.surface === 'tutorial' ? (
          <Deployment enabled={enabled} step={step} />
        ) : scenario.surface === 'documentation' ? (
          <Activity enabled={enabled} />
        ) : (
          <Release
            key={String(fixed)}
            fixed={fixed}
            enabled={enabled}
            review={scenario.surface === 'review'}
            onInvalid={setInvalid}
          />
        )}
      </div>
      <div className="scenario-outcome">
        <span className="eyebrow">WHAT THIS MAKES EASIER</span>
        <p>{isWorkspace ? current.outcome : scenario.outcome}</p>
        {scenario.surface === 'review' && (
          <p>
            <strong>Try it:</strong> leave the name empty and click Publish preview. Use Tab to
            inspect where focus went.
          </p>
        )}
      </div>
      <Artifacts
        plan={plan}
        surface={
          isWorkspace && perspective !== 'explain'
            ? perspective === 'handoff'
              ? 'security'
              : 'team'
            : scenario.surface
        }
      />
      {isWorkspace && (
        <p className="boundary-note">
          Product asks what must happen. UX asks how it should read. Engineering shows what exists.
          QE verifies behavior. Each viewpoint has its own working example; requirements, designs
          and test records stay in your existing tools.
        </p>
      )}
    </article>
  );
}
export function UseCases() {
  const path = useMatch({ strict: false, select: (s) => s.pathname });
  const selected = scenarios.find((s) => path === `/use-cases/${s.id}`);
  const scenario = selected ?? scenarios[0];
  return (
    <main id="main" className="showcase-page">
      <div className="showcase-intro">
        <span className="eyebrow">STET / IN CONTEXT</span>
        <h1>
          {selected ? (
            selected.seoTitle
          ) : (
            <>
              Make the interface
              <br />
              <em>part of the conversation.</em>
            </>
          )}
        </h1>
        <p>
          {selected
            ? selected.introduction
            : 'Explain a risky action. Review a bug. Hand off working code. These live UI annotation examples connect intent to the real interface.'}
        </p>
      </div>
      <div className="showcase-layout">
        <aside className="case-navigation" aria-label="Use cases">
          {['Agentic', 'Developer'].map((group) => (
            <div key={group}>
              <h2>{group}</h2>
              {scenarios
                .filter((s) => s.group === group)
                .map((s) => (
                  <Link
                    key={s.id}
                    to={`/use-cases/${s.id}`}
                    aria-current={s.id === scenario.id ? 'page' : undefined}
                  >
                    {s.title}
                    <span>{s.subtitle}</span>
                  </Link>
                ))}
            </div>
          ))}
          <p>
            One annotation vocabulary.
            <br />
            Many useful perspectives.
          </p>
        </aside>
        <ScenarioView key={scenario.id} scenario={scenario} />
      </div>
      <section className="scenario-outcome">
        <h2>Make this example your own</h2>
        <p>
          Inspect the plan and source above, then adapt the marks to your existing controls. Stet
          supplies emphasis; your application owns validation, progression, and behavior.
        </p>
        <p>
          <Link to="/docs/react">Attach annotations with React refs</Link> ·{' '}
          <Link to="/docs" hash="api">
            Explore the six annotation primitives
          </Link>{' '}
          · <Link to="/agent-workflow">Follow the coding-agent workflow</Link>
        </p>
        <p>
          {scenarios
            .filter((s) => s.id !== scenario.id && s.group === scenario.group)
            .slice(0, 2)
            .map((s) => (
              <span key={s.id}>
                <Link to={`/use-cases/${s.id}`}>{s.seoTitle}</Link>
                {' · '}
              </span>
            ))}
        </p>
      </section>
    </main>
  );
}
