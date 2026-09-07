import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Workspace } from '../showcase/Workspace';
import { Artifacts } from '../showcase/Artifacts';
import { workspacePlans } from '../showcase/scenarios';
import { capabilities } from '../showcase/canonical';
import { Code } from '../components/Code';
import { usePageMeta } from '../usePageMeta';
import '../showcase/showcase.css';
const stages = [
  {
    label: 'Task',
    title: 'Start with a useful request.',
    body: 'Explain this settings screen and make the destructive action understandable.',
    code: 'Your coding agent receives a task in your project.\nThis page is a deterministic walkthrough, not a live agent session.',
  },
  {
    label: 'Skill',
    title: 'Choose the authoring workflow.',
    body: 'stet-explain-ui guides emphasis and preservation of native warnings. Review and showcase have different goals; all use the base implementation workflow.',
    code: 'npm install @funsaized/stet@0.1.0\nnpx stet agent init --tool codex\n# Also supports claude, cursor and opencode.',
  },
  {
    label: 'Inspect',
    title: 'Read the installed contract.',
    body: `This checkout exposes ${capabilities.package.name} ${capabilities.package.version}. Project discovery identifies framework evidence; the agent confirms the relevant application.`,
    code: './node_modules/.bin/stet inspect --project . --json\n./node_modules/.bin/stet schema annotation-plan --json',
  },
  {
    label: 'Plan',
    title: 'Make the intent inspectable.',
    body: 'Choose one circle and the existing remove ref. The actual version-1 plan is available below. Target records guide source edits; they are not runtime selectors.',
    code: JSON.stringify(workspacePlans.explain, null, 2),
  },
  {
    label: 'Validate',
    title: 'Check shape before editing.',
    body: 'The bundled plan is validated by repository tests. Validation checks supported fields, not visibility, truthfulness or visual quality.',
    code: './node_modules/.bin/stet validate annotation-plan.json --json\n# Run in your project; inspect the actual result and exit code.',
  },
  {
    label: 'Implement',
    title: 'Attach through the framework.',
    body: 'Adapt the canonical React snippet to the existing remove ref. The prebuilt fixture below uses that adapter, so its button retains focus, handlers and layout.',
    code: './node_modules/.bin/stet snippet circle --framework react\n// In the existing component:\n<Circle target={remove} {...ink.explain} />',
  },
  {
    label: 'Verify',
    title: 'Inspect the working application.',
    body: 'Build, exercise confirmation, compare annotation-on/off layout, and inspect a narrow viewport. Browser/tests provide observations. Stet only communicates them.',
    code: 'npm run check\nnpm --prefix website run build\nnpm --prefix website test -- tests/showcase.spec.ts\n# In your project, use its own checks and browser tooling.',
  },
  {
    label: 'Handoff',
    title: 'Give the human a place to look.',
    body: 'Point to the real change, report the checks performed, and identify remaining work. A circle never substitutes for evidence or a native safety warning.',
    code: 'Implemented: exact-name confirmation, Escape cancellation.\nEvidence: fixture browser tests and inspectable source.\nBoundary: local demo; no deletion backend.',
  },
];
export function AgentWorkflow() {
  const [index, setIndex] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const stage = stages[index];
  usePageMeta('From task to visual handoff — Stet', '/agent-workflow');
  return (
    <main id="main" className="showcase-page workflow-page">
      <div className="showcase-intro">
        <span className="eyebrow">THE AGENT WORKFLOW</span>
        <h1>
          From a sentence
          <br />
          <em>to something you can inspect.</em>
        </h1>
        <p>
          Natural language → structured plan → framework code → verified UI. Deterministic
          walkthrough; no model runs on this page.
        </p>
      </div>
      <nav className="workflow-stages" aria-label="Agent workflow stages">
        {stages.map((s, i) => (
          <button
            key={s.label}
            aria-current={index === i ? 'step' : undefined}
            onClick={() => setIndex(i)}
          >
            <small>0{i + 1}</small>
            {s.label}
          </button>
        ))}
      </nav>
      <div className="workflow-grid">
        <section className="workflow-explanation" aria-live="polite">
          <span className="eyebrow">
            {index + 1} / {stages.length}
          </span>
          <h2>{stage.title}</h2>
          <p>{stage.body}</p>
          <Code text={stage.code} />
          <div className="app-actions">
            <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Previous
            </button>
            <button disabled={index === stages.length - 1} onClick={() => setIndex(index + 1)}>
              Next stage
            </button>
          </div>
        </section>
        <div>
          <div className="live-toolbar">
            <span>PREBUILT, WORKING FIXTURE</span>
            <button
              disabled={index < 5}
              aria-pressed={index >= 5 && enabled}
              onClick={() => setEnabled(!enabled)}
            >
              {index < 5 ? 'Before annotations' : enabled ? 'Annotations on' : 'Annotations off'}
            </button>
          </div>
          <Workspace
            enabled={enabled && index >= 5}
            perspective={index === 7 ? 'handoff' : 'explain'}
          />
        </div>
      </div>
      <Artifacts
        plan={index === 7 ? workspacePlans.handoff : workspacePlans.explain}
        surface="workspace"
      />
      <p className="boundary-note">
        Try a concrete{' '}
        <Link to="/use-cases/$scenario" params={{ scenario: 'security-handoff' }}>
          implementation handoff
        </Link>
        , or see{' '}
        <Link to="/use-cases/$scenario" params={{ scenario: 'workspace-deletion' }}>
          Product, UX and QE perspectives
        </Link>{' '}
        on this same feature.
      </p>
    </main>
  );
}
