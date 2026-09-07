import { useRef, useState } from 'react';
import { Circle, Highlight, Underline } from '@funsaized/stet/react';
import { ink } from './options';
export function TeamExamples({
  enabled,
  perspective,
}: {
  enabled: boolean;
  perspective: 'product' | 'ux' | 'qe';
}) {
  const total = useRef<HTMLParagraphElement>(null);
  const recovery = useRef<HTMLButtonElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const [annual, setAnnual] = useState(true);
  const [query, setQuery] = useState('roadmap');
  const [status, setStatus] = useState('');
  return (
    <div className="application" data-fixture={perspective}>
      <header>
        <span className="app-monogram">F</span>
        <div>
          <strong>Fieldnotes</strong>
          <span>
            {perspective === 'product'
              ? 'Billing / Upgrade'
              : perspective === 'ux'
                ? 'Projects / Search'
                : 'Data / Import'}
          </span>
        </div>
        <small>Local demo</small>
      </header>
      <div className="app-body">
        {perspective === 'product' ? (
          <>
            <h3>A clear price before commitment.</h3>
            <p>Product acceptance: show the full amount due for the selected billing period.</p>
            <label className="app-check">
              <input
                type="checkbox"
                checked={annual}
                onChange={(e) => {
                  setAnnual(e.target.checked);
                  setStatus('');
                }}
              />
              Annual billing — save 20%
            </label>
            <p ref={total}>
              <strong>
                {annual
                  ? '$192 due today · $16/month, billed annually'
                  : '$20 due today · billed monthly'}
              </strong>
            </p>
            <button
              className="app-primary"
              onClick={() =>
                setStatus(
                  `Demo plan selected: ${annual ? '$192 annually' : '$20 monthly'}. No payment taken.`,
                )
              }
            >
              Choose plan
            </button>
          </>
        ) : perspective === 'ux' ? (
          <>
            <h3>An empty result needs a next step.</h3>
            <label htmlFor="project-search">Search projects</label>
            <input id="project-search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <p>
              {query.trim()
                ? `No projects match “${query}”. Try a different name or clear your search.`
                : 'All projects: Website refresh · Mobile app'}
            </p>
            <button ref={recovery} onClick={() => setQuery('')}>
              Clear search
            </button>
          </>
        ) : (
          <>
            <h3>Test the import boundary.</h3>
            <p>
              QE check: a CSV file is accepted; other extensions produce a useful error. This demo
              checks the filename only.
            </p>
            <label htmlFor="import-file">Import file</label>
            <input
              ref={upload}
              id="import-file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setStatus(
                  file
                    ? /\.csv$/i.test(file.name)
                      ? `${file.name} accepted for local preview.`
                      : 'Choose a CSV file. Nothing imported.'
                    : '',
                );
              }}
            />
          </>
        )}
        <output>{status}</output>
      </div>
      {enabled && perspective === 'product' && <Highlight target={total} {...ink.product} />}
      {enabled && perspective === 'ux' && <Underline target={recovery} {...ink.ux} />}
      {enabled && perspective === 'qe' && <Circle target={upload} {...ink.qe} />}
    </div>
  );
}
