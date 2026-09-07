import { useRef, useState } from 'react';
import { Circle, Highlight, Underline } from '@funsaized/stet/react';
import { ink } from './options';
export function Deployment({ enabled, step }: { enabled: boolean; step: number }) {
  const branch = useRef<HTMLSelectElement>(null);
  const environment = useRef<HTMLFieldSetElement>(null);
  const deploy = useRef<HTMLButtonElement>(null);
  const [revision, setRevision] = useState('main');
  const [destination, setDestination] = useState('Staging');
  const [status, setStatus] = useState('No deployment queued.');
  return (
    <div className="application" data-fixture="deployment">
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes Deploy</strong>
          <span>Pipeline / New deployment</span>
        </div>
        <small>Local demo</small>
      </header>
      <form
        className="app-body"
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(`${revision} queued for ${destination}. Local preview only.`);
        }}
      >
        <h3>From branch to release.</h3>
        <p>Choose your revision and destination, then queue the deployment.</p>
        <label htmlFor="deploy-branch">Source branch</label>
        <select
          id="deploy-branch"
          ref={branch}
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
        >
          <option>main</option>
          <option>release/security</option>
          <option>feature/search</option>
        </select>
        <fieldset ref={environment}>
          <legend>Environment</legend>
          {['Staging', 'Production'].map((value) => (
            <label className="app-check" key={value}>
              <input
                type="radio"
                name="environment"
                checked={destination === value}
                onChange={() => setDestination(value)}
              />
              {value}
            </label>
          ))}
        </fieldset>
        <p className="app-hint">
          Staging lets teammates verify a release before it reaches production.
        </p>
        <button className="app-primary" ref={deploy}>
          Queue deployment
        </button>
        <output>{status}</output>
      </form>
      {enabled && step === 0 && <Underline target={branch} {...ink.branch} />}
      {enabled && step === 1 && <Highlight target={environment} {...ink.environment} />}
      {enabled && step === 2 && <Circle target={deploy} {...ink.deploy} />}
    </div>
  );
}
