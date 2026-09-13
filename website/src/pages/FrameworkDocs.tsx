import { Link, useMatch } from '@tanstack/react-router';
import { frameworks } from '../frameworks';
import { canonicalCode } from '../showcase/canonical';
import { Code } from '../components/Code';
import { CopyButton } from '../components/CopyButton';
import { INSTALL, REPO } from '../constants';
export function FrameworkDocs() {
  const path = useMatch({ strict: false, select: (s) => s.pathname });
  const framework = frameworks.find((f) => path === `/docs/${f.slug}`)!;
  return (
    <main id="main" className="docs-layout">
      <aside className="docs-sidebar">
        <span className="eyebrow">THE FIELD GUIDE</span>
        <Link to="/docs">Documentation overview</Link>
        {frameworks.map((f) => (
          <Link
            key={f.id}
            to={`/docs/${f.slug}`}
            aria-current={f.id === framework.id ? 'page' : undefined}
          >
            {f.name} annotations
          </Link>
        ))}
        <a href="#lifecycle">Lifecycle and cleanup</a>
        <a href="#accessibility">Styling and accessibility</a>
      </aside>
      <article className="docs-content">
        <span className="eyebrow">STET / {framework.name.toUpperCase()}</span>
        <h1>
          UI annotations in <em>{framework.name}.</em>
        </h1>
        <p className="docs-lead">
          Stet is a free, MIT-licensed UI annotation library. Add hand-sketched marks to live{' '}
          {framework.name} interfaces while your existing controls keep their layout, events, and
          semantics.
        </p>
        <h2>Install and make your first mark</h2>
        <CopyButton value={INSTALL} className="install-command">
          <code>{INSTALL}</code>
        </CopyButton>
        <p>
          The package is <code>@funsaized/stet</code>. These ESM examples use the project’s
          generated framework templates. Pin your installed version and inspect its capabilities
          before using newer options.
        </p>
        <p>{framework.api}</p>
        {framework.id === 'vanilla' && (
          <p>
            The canonical example uses TypeScript. Compile it with your app’s toolchain, or omit the
            Element type annotation when using plain JavaScript.
          </p>
        )}
        <div className="framework-code">
          <div className="code-filename">
            <span>{framework.name} / first mark</span>
            <CopyButton value={canonicalCode(framework.id)} />
          </div>
          <Code text={canonicalCode(framework.id)} />
        </div>
        <p>
          <a href={`${REPO}/blob/master/agent/templates/${framework.id}`}>
            Browse the canonical {framework.name} templates
          </a>
        </p>
        <h2 id="lifecycle">Keep marks in step with the interface</h2>
        <p>
          These lifecycle templates are copied from installed <code>@funsaized/stet@0.1.0</code>.
        </p>
        <p>{framework.lifecycle}</p>
        <div className="framework-code">
          <div className="code-filename">
            <span>{framework.name} / lifecycle</span>
            <CopyButton value={canonicalCode(framework.id, 'lifecycle')} />
          </div>
          <Code text={canonicalCode(framework.id, 'lifecycle')} />
        </div>
        <h2 id="accessibility">Ink, layout, and accessible meaning</h2>
        <p>
          Import <code>@funsaized/stet/style.css</code> globally. Set <code>--stet-stroke</code>,{' '}
          <code>--stet-fill</code>, and <code>--stet-paper</code> to fit your design. SVG overlays
          do not occupy layout space or intercept pointer input.
        </p>
        <p>
          Keep native labels, errors, keyboard focus, and event handlers on your controls. Give
          meaningful marks a <code>description</code>; color alone cannot explain a finding. Sticky
          notes and arrow labels supply readable text. Optional ink motion respects reduced-motion
          preferences.
        </p>
        <p>
          Stet uses browser DOM APIs. Attach handles after mount, not during server rendering.
          Resize and scroll tracking cannot cover every transform or top-layer dialog;{' '}
          <a href={`${REPO}/blob/master/docs/reference.md`}>
            read placement limits and the full API reference
          </a>
          .
        </p>
        <h2>Where this fits</h2>
        <p>{framework.use}</p>
        <p>
          <Link to="/use-cases/form-review">Reproduce and annotate a form focus bug</Link> ·{' '}
          <Link to="/use-cases/live-documentation">Document an interactive activity inbox</Link> ·{' '}
          <Link to="/playground">Try all six primitives in the playground</Link>
        </p>
        <h2>Work with your coding agent</h2>
        <p>
          The agent inspects your installed package, validates an annotation plan, and adapts a{' '}
          {framework.name} template. Plans are authoring artifacts, not a runtime selector engine.
          Browser verification must still check placement and behavior.
        </p>
        <p>
          <Link to="/docs" hash="agents">
            Install project Agent Skills
          </Link>{' '}
          · <Link to="/agent-workflow">See the complete visual handoff workflow</Link>
        </p>
        <p>
          <a href={`${REPO}/blob/master/agent/capabilities.json`}>Machine-readable capabilities</a>{' '}
          ·{' '}
          <a href={`${REPO}/blob/master/agent/schemas/annotation-plan.schema.json`}>
            Annotation plan schema
          </a>{' '}
          · <a href={`${REPO}/blob/master/docs/reference.md`}>Full API reference</a>
        </p>
      </article>
    </main>
  );
}
