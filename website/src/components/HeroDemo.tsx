import { useRef, useState, type CSSProperties } from 'react';
import { Circle, Highlight, Sticky, Underline } from '@funsaized/stet/react';
import { Icon } from './Icon';
export function HeroDemo() {
  const title = useRef<HTMLSpanElement>(null),
    ship = useRef<HTMLButtonElement>(null),
    task = useRef<HTMLSpanElement>(null),
    note = useRef<HTMLSpanElement>(null);
  const [marks, setMarks] = useState(true),
    [seed, setSeed] = useState(12),
    [shipped, setShipped] = useState(false);
  const [name, setName] = useState('Something good'),
    [tasks, setTasks] = useState([true, true, false]);
  return (
    <div className="hero-demo">
      <div className="demo-margin">
        <span className="handwritten demo-caption">your UI, with a human touch</span>
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
          <span>a-small-good-thing.app</span>
          <span>↗</span>
        </div>
        <div className="app-content">
          <div className="project-heading">
            <span className="project-icon">✳︎</span>
            <span>THE LITTLE LAUNCH</span>
            <span className="draft-badge">{shipped ? 'Live!' : 'Draft'}</span>
          </div>
          <h2>
            Let’s make
            <br />
            <span ref={title}>something good.</span>
          </h2>
          <p>Big ideas start with little things.</p>
          <label className="field-label" htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />
          <div className="task-list">
            {['Make it useful', 'Make it feel human', 'Make a little noise'].map((label, i) => (
              <label className="task" key={label}>
                <input
                  type="checkbox"
                  checked={tasks[i]}
                  onChange={() => setTasks((old) => old.map((v, j) => (i === j ? !v : v)))}
                />
                <span ref={i === 1 ? task : undefined}>{label}</span>
              </label>
            ))}
          </div>
          <div className="launch-row">
            <button
              className={`launch-button ${shipped ? 'shipped' : ''}`}
              ref={ship}
              onClick={() => setShipped(!shipped)}
            >
              {shipped ? 'It’s out in the world!' : 'Ship something good'}
              <Icon name={shipped ? 'check' : 'arrow'} size={16} />
            </button>
            <span className="launch-note" ref={note}>
              {shipped ? 'you did it!' : 'Ready when you are.'}
            </span>
          </div>
          <output className="sr-only" aria-label="Launch status">
            {shipped ? `${name || 'Your project'} has launched. This is a local demo.` : ''}
          </output>
        </div>
      </div>
      <div className="demo-toolbar">
        <span>
          <span className="status-dot" /> Real controls. Go on, click them.
        </span>
        <div>
          <button
            onClick={() => setSeed((s) => s + 1)}
            aria-label="Resketch demo"
            title="Draw a fresh sketch"
          >
            <Icon name="refresh" size={16} />
          </button>
          <button
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
          <Underline target={title} stroke="#c84935" seed={seed} width={2.5} />
          <Highlight target={task} fill="#f4cd46" seed={seed} />
          <Circle
            target={ship}
            stroke="#c84935"
            seed={seed}
            padding={9}
            roughness={1.4}
            resketchOnHover
          />
          <Sticky
            target={note}
            text={
              shipped
                ? 'Small thing. Big feeling. Nicely done ♡'
                : 'The world could use more of this.'
            }
            side="top"
            seed={seed}
            fill="#f6e89d"
          />
        </>
      )}
      {shipped && (
        <div className="confetti" aria-hidden="true" key="confetti">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
