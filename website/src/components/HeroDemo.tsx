import { useRef, useState } from 'react';
import { Circle, Underline } from '@funsaized/stet/react';
import { Icon } from './Icon';

export function HeroDemo() {
  const save = useRef<HTMLButtonElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(false);
  const [marks, setMarks] = useState(true);
  const [motion, setMotion] = useState(false);
  const [seed, setSeed] = useState(12);
  const ready = title.trim().length > 0;
  const boil = motion ? 0.3 : 0;
  const reason = ready
    ? 'Title is set. Save is available.'
    : 'Save stays off until the title has a name.';
  return (
    <div className="hero-demo">
      <div className="demo-margin">
        <span className="handwritten demo-caption">type a title, watch the reason</span>
        <svg
          className="caption-arrow"
          width="53"
          height="49"
          viewBox="0 0 53 49"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 3c34-6 44 18 28 38m-3-14 2 16 15-7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="app-window">
        <div className="window-top">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>draft-note.app</span>
          <span>↗</span>
        </div>
        <form
          className="app-content"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) setSaved(true);
          }}
        >
          <div className="project-heading">
            <span className="project-icon">✳︎</span>
            <span>LIVE EXPLANATION</span>
            <span className="draft-badge">{saved ? 'Saved' : ready ? 'Ready' : 'Blocked'}</span>
          </div>
          <h2>{ready ? 'Save is ready.' : 'Why is Save disabled?'}</h2>
          <p>A screenshot cannot show this. Change the title and the reason follows.</p>
          <label className="field-label" htmlFor="note-title">
            Title
          </label>
          <input
            id="note-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSaved(false);
            }}
            maxLength={50}
            autoComplete="off"
          />
          <p className="save-hint" ref={hint} id="save-hint">
            {reason}
          </p>
          <div className="launch-row">
            <button
              type="submit"
              className={`launch-button ${saved ? 'shipped' : ''}`}
              ref={save}
              disabled={!ready}
              aria-describedby="save-hint"
            >
              {saved ? 'Saved' : 'Save'}
              <Icon name={saved ? 'check' : 'arrow'} size={16} />
            </button>
            <span className="launch-note">
              {saved ? 'Local demo only.' : 'Native Save control.'}
            </span>
          </div>
          <output className="sr-only" aria-live="polite" aria-label="Save status">
            {saved ? `Saved “${title}”. Nothing was sent.` : ''}
          </output>
        </form>
      </div>
      <div className="demo-toolbar">
        <span>
          <span className="status-dot" /> Real controls. Go on, use them.
        </span>
        <div>
          <button
            type="button"
            onClick={() => setSeed((value) => value + 1)}
            aria-label="Resketch demo"
            title="Draw a fresh sketch"
          >
            <Icon name="refresh" size={16} />
          </button>
          <button
            type="button"
            className={`toggle ${motion ? 'on' : ''}`}
            role="switch"
            aria-checked={motion}
            aria-label="Optional motion"
            onClick={() => setMotion(!motion)}
          >
            <span />
          </button>
          <span>{motion ? 'boil on' : 'still'}</span>
          <button
            type="button"
            className={`toggle ${marks ? 'on' : ''}`}
            role="switch"
            aria-checked={marks}
            aria-label="Show annotations"
            onClick={() => setMarks(!marks)}
          >
            <span />
          </button>
          <span>stet {marks ? 'on' : 'off'}</span>
        </div>
      </div>
      {marks && (
        <>
          <Circle
            target={save}
            stroke="#c84935"
            seed={seed}
            padding={9}
            roughness={1.4}
            boil={boil}
            description={
              ready ? 'Save is available.' : 'Save is disabled because the title is empty.'
            }
          />
          <Underline
            target={hint}
            stroke="#c84935"
            seed={seed}
            width={2.5}
            boil={boil}
            description={ready ? 'The title now satisfies Save.' : 'This is why Save is disabled.'}
          />
        </>
      )}
    </div>
  );
}
