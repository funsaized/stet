import { useState } from 'react';
import type { AnnotationPlan } from '../../../agent/annotation-plan';
import { Code } from '../components/Code';
import { CopyButton } from '../components/CopyButton';
import workspaceSource from './Workspace.tsx?raw';
import securitySource from './Security.tsx?raw';
import releaseSource from './Release.tsx?raw';
import teamSource from './TeamExamples.tsx?raw';
import deploymentSource from './Deployment.tsx?raw';
import activitySource from './Activity.tsx?raw';
import optionsSource from './options.ts?raw';
import { canonicalCode, capabilities, type Framework } from './canonical';

export function Artifacts({ plan, surface }: { plan: AnnotationPlan; surface: string }) {
  const [panel, setPanel] = useState('Plan');
  const [framework, setFramework] = useState<Framework>('react');
  const source =
    surface === 'team'
      ? teamSource
      : surface === 'tutorial'
        ? deploymentSource
        : surface === 'documentation'
          ? activitySource
          : surface === 'workspace'
            ? workspaceSource
            : surface === 'security'
              ? securitySource
              : releaseSource;
  const code =
    panel === 'Plan'
      ? JSON.stringify(plan, null, 2)
      : panel === 'Source'
        ? source
        : panel === 'Shared options'
          ? optionsSource
          : canonicalCode(framework, plan.annotations[0].primitive);
  return (
    <details className="artifact-panel">
      <summary>Inspect plan, source & verification</summary>
      <div className="artifact-tabs" aria-label="Artifact">
        {['Plan', 'Source', 'Shared options', 'Frameworks', 'Verification'].map((p) => (
          <button key={p} aria-pressed={panel === p} onClick={() => setPanel(p)}>
            {p}
          </button>
        ))}
      </div>
      {panel === 'Verification' ? (
        <div className="verification-copy">
          <h3>Evidence comes from the application.</h3>
          <p>
            This is a deterministic, prebuilt example. No model, test runner or visual QA engine
            runs inside Stet.
          </p>
          <p>
            {surface === 'workspace'
              ? 'The browser suite exercises exact-name confirmation, Escape, restored focus, local deletion and annotation cleanup.'
              : surface === 'security'
                ? 'The browser suite exercises the password threshold, local session revocation and conditional two-factor setup. Real authentication is not implemented.'
                : surface === 'review'
                  ? 'The suite reproduces the focus failure, then checks that the fixed version focuses the invalid field with annotations on and off.'
                  : surface === 'team'
                    ? 'The browser suite checks billing totals, empty-search recovery and CSV filename acceptance and rejection.'
                    : surface === 'tutorial'
                      ? 'The browser suite changes the branch and environment, advances tutorial steps and queues a local deployment.'
                      : surface === 'documentation'
                        ? 'The browser suite opens event details, filters unread activity and marks events as read.'
                        : 'The browser suite fills the release name, changes the audience and publishes a local preview. Tutorial steps preserve input state.'}
          </p>
          <p>
            All bundled plans are schema-validated. The production site is type-checked; canonical
            integration templates are compiled for all five frameworks. Browser tests cover pointer
            transparency and desktop/mobile layouts. These checks do not certify arbitrary
            applications.
          </p>
          <Code
            text={
              '# From the repository root\nnpm test\nnpm run test:templates\nnpm --prefix website run build\nnpm --prefix website test -- tests/showcase.spec.ts'
            }
          />
          <a href="https://github.com/funsaized/stet/blob/master/docs/showcase-verification.md">
            Read the verification report ↗
          </a>
        </div>
      ) : (
        <>
          {panel === 'Plan' && (
            <p>
              Actual schema-valid React plan. Targets refer to source refs; this JSON is never
              executed by the drawing runtime. After installing @funsaized/stet, copy to{' '}
              <code>annotation-plan.json</code> and run{' '}
              <code>./node_modules/.bin/stet validate annotation-plan.json --json</code>.
            </p>
          )}
          {panel === 'Source' && (
            <p>
              The actual mounted fixture source. Copy its shared options from “Shared options”;
              styles are in <code>website/src/showcase/showcase.css</code>. The example retains
              application-owned handlers and uses Stet’s React cleanup.
            </p>
          )}
          {panel === 'Frameworks' && (
            <>
              <p>
                Canonical integration starting point for the first primitive in this plan. Adapt
                targets to your app; this is not a translation of the whole fixture.
              </p>
              <label>
                Framework{' '}
                <select
                  aria-label="Framework"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as Framework)}
                >
                  {Object.keys(capabilities.frameworks).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <div className="artifact-code">
            <CopyButton value={code} />
            <Code text={code} />
          </div>
        </>
      )}
    </details>
  );
}
