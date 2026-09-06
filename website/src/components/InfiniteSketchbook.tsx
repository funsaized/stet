import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { circle, underline, highlight, arrow, mark, type StetHandle } from '@funsaized/stet';
import { Icon } from './Icon';

const palettes = [
  {
    name: 'An afternoon in the garden',
    ink: ['#a53935', '#396448', '#886024'],
    paper: ['#f4ded1', '#e4ead6', '#f5e7af'],
  },
  {
    name: 'Blue ink, big ideas',
    ink: ['#345d94', '#68508a', '#336666'],
    paper: ['#dfe8f3', '#e9dff0', '#dceddf'],
  },
  {
    name: 'A very good orange',
    ink: ['#a34b25', '#8c3e62', '#645933'],
    paper: ['#f6dfbc', '#f0dae6', '#eae6cc'],
  },
  {
    name: 'Notes from the coast',
    ink: ['#28676a', '#425b88', '#8d4d37'],
    paper: ['#dcece8', '#e0e6f4', '#f2dfcf'],
  },
];
const phrases = [
  'a tiny good thing.',
  'more of this, please.',
  'made with feeling.',
  'look, a little magic.',
  'leave room for joy.',
  'a very promising start.',
];
const kinds = [
  'button',
  'quote',
  'checklist',
  'note',
  'toggle',
  'arrow',
  'input',
  'ticket',
  'verdict',
] as const;
type SketchKind = (typeof kinds)[number];
type Sketch = {
  kind: SketchKind;
  ink: string;
  paper: string;
  seed: number;
  rotation: number;
  width: number;
  x: number;
  y: number;
  boil: number;
  phrase: string;
};

function randomSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
function randomFrom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = Math.imul(value ^ (value >>> 15), value | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
function sketchesFor(seed: number, row: number, palette: number, columns: number): Sketch[] {
  const random = randomFrom(seed + row * 7919);
  return Array.from({ length: columns }, (_, column) => {
    const color = Math.floor(random() * 3);
    return {
      kind: kinds[(row * columns + column + Math.floor(random() * kinds.length)) % kinds.length],
      ink: palettes[palette].ink[color],
      paper: palettes[palette].paper[color],
      seed: Math.floor(random() * 1e8),
      rotation: random() * 18 - 9,
      width: 235 + random() * 45,
      x: random() * 36 - 18,
      y: random() * 85 + 12,
      boil: 0.2 + random() * 0.5,
      phrase: phrases[Math.floor(random() * phrases.length)],
    };
  });
}

function SketchCard({ sketch, moving }: { sketch: Sketch; moving: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = host.current!;
    const target = node.querySelector<HTMLElement>('[data-mark]')!;
    const options = {
      seed: sketch.seed,
      stroke: sketch.ink,
      fill: sketch.paper,
      roughness: 1.1,
      boil: moving ? sketch.boil : 0,
      width: 2.3,
      resketchOnHover: moving,
    };
    const handles: StetHandle[] = [];
    switch (sketch.kind) {
      case 'button':
      case 'ticket':
        handles.push(circle(target, { ...options, padding: 9 }));
        break;
      case 'quote':
      case 'input':
        handles.push(underline(target, options));
        break;
      case 'checklist':
        handles.push(highlight(target, { ...options, fill: sketch.ink }));
        break;
      case 'note':
        handles.push(underline(target, options));
        break;
      case 'toggle':
      case 'verdict':
        handles.push(mark(target, 'right', options));
        break;
      case 'arrow':
        handles.push(
          arrow(node.querySelector('[data-from]')!, target, { ...options, curvature: -0.3 }),
        );
        break;
    }
    // Stet follows scroll/resize itself. Refresh only during this finite entrance.
    let frame = 0;
    let animation: Animation | undefined;
    if (moving && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animation = node.animate(
        [
          { translate: `${sketch.x * 3}px 55px`, opacity: 0 },
          { translate: '0px 0px', opacity: 1 },
        ],
        { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
      const refresh = () => {
        handles.forEach((handle) => handle.refresh());
        if (animation?.playState === 'running') frame = requestAnimationFrame(refresh);
      };
      frame = requestAnimationFrame(refresh);
    }
    return () => {
      cancelAnimationFrame(frame);
      animation?.cancel();
      handles.forEach((handle) => handle.destroy());
    };
  }, [sketch, moving]);
  const style = {
    '--sketch-ink': sketch.ink,
    '--sketch-paper': sketch.paper,
    '--sketch-angle': `${sketch.rotation}deg`,
    '--sketch-x': `${sketch.x}px`,
    '--sketch-y': `${sketch.y}px`,
    '--sketch-width': `${sketch.width}px`,
  } as CSSProperties;
  return (
    <div
      ref={host}
      className={`loose-sketch loose-sketch-${sketch.kind}`}
      style={style}
      data-sketch-seed={sketch.seed}
    >
      {sketch.kind === 'button' && (
        <>
          <span className="handwritten tiny-aside">a good place to start ↘</span>
          <button data-mark onClick={() => setActive(!active)} className="sketch-button">
            {active ? 'A little joy, delivered ✓' : 'Make something good'}
            <Icon name="spark" size={16} />
          </button>
        </>
      )}
      {sketch.kind === 'quote' && (
        <>
          <span className="sketch-index">A NOTE TO SELF</span>
          <p className="sketch-quote" data-mark>
            {sketch.phrase}
          </p>
          <span className="handwritten tiny-aside">yes, that includes you.</span>
        </>
      )}
      {sketch.kind === 'checklist' && (
        <div className="scrap-card">
          <span className="sketch-index">TODAY’S BIG PLANS</span>
          <label>
            <input type="checkbox" defaultChecked /> Make a little progress
          </label>
          <label>
            <input type="checkbox" defaultChecked />
            <span data-mark>Keep the human bits</span>
          </label>
          <label>
            <input type="checkbox" /> Call it a good day
          </label>
        </div>
      )}
      {sketch.kind === 'note' && (
        <div className="paper-scrap">
          <span className="paper-tape" />
          <p>
            Reminder:
            <br />
            <span data-mark>{sketch.phrase}</span>
          </p>
          <span className="handwritten">— your future self</span>
        </div>
      )}
      {sketch.kind === 'toggle' && (
        <div className="sketch-toggle-card">
          <span className="handwritten tiny-aside">the important settings</span>
          <div>
            <span data-mark>More whimsy</span>
            <button
              className={`toggle ${active ? '' : 'on'}`}
              role="switch"
              aria-label="More whimsy"
              aria-checked={!active}
              onClick={() => setActive(!active)}
            >
              <span />
            </button>
          </div>
          <span className="sketch-index">HIGHLY RECOMMENDED</span>
        </div>
      )}
      {sketch.kind === 'arrow' && (
        <div className="sketch-journey">
          <span data-from className="handwritten">
            a little idea
          </span>
          <span data-mark className="sketch-destination">
            something
            <br />
            <em>wonderful.</em>
          </span>
          <span className="handwritten tiny-aside">you’re getting there.</span>
        </div>
      )}
      {sketch.kind === 'input' && (
        <div className="sketch-input">
          <label>
            <span className="handwritten tiny-aside">what’s on your mind?</span>
            <input
              data-mark
              aria-label="Your next little idea"
              placeholder="A very good idea…"
              maxLength={45}
            />
          </label>
          <span className="sketch-index">THERE’S ROOM FOR IT HERE.</span>
        </div>
      )}
      {sketch.kind === 'ticket' && (
        <div className="sketch-ticket">
          <span className="sketch-index">ONE SMALL PERMISSION SLIP</span>
          <p>
            It’s okay to
            <br />
            <span data-mark>be a beginner.</span>
          </p>
          <span className="ticket-bottom">
            ADMIT ONE HUMAN <Icon name="spark" size={18} />
          </span>
        </div>
      )}
      {sketch.kind === 'verdict' && (
        <div className="sketch-verdict">
          <span className="handwritten tiny-aside">editor’s verdict:</span>
          <p data-mark>let it stand.</p>
          <span className="sketch-index">SOME THINGS ARE ALREADY GOOD.</span>
        </div>
      )}
    </div>
  );
}

function SketchRow({
  seed,
  row,
  palette,
  columns,
  rowHeight,
  moving,
}: {
  seed: number;
  row: number;
  palette: number;
  columns: number;
  rowHeight: number;
  moving: boolean;
}) {
  // The row's layout is deterministic within an edition, including when revisited.
  const [sketches] = useState(() => sketchesFor(seed, row, palette, columns));
  return (
    <div
      className="sketch-row"
      style={{
        top: row * rowHeight,
        height: rowHeight,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      data-row={row}
    >
      {sketches.map((sketch, i) => (
        <SketchCard key={i} sketch={sketch} moving={moving} />
      ))}
    </div>
  );
}

export function InfiniteSketchbook() {
  const [edition, setEdition] = useState(() => ({
    seed: randomSeed(),
    palette: Math.floor(Math.random() * palettes.length),
    number: 1,
  }));
  const [rows, setRows] = useState(3),
    [endless, setEndless] = useState(true),
    [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [view, setView] = useState({ start: 0, end: 0, columns: 3, rowHeight: 360 });
  const canvas = useRef<HTMLDivElement>(null),
    sentinel = useRef<HTMLDivElement>(null),
    section = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = canvas.current!.getBoundingClientRect();
      const columns = rect.width < 600 ? 1 : rect.width < 950 ? 2 : 3;
      const rowHeight = columns === 1 ? 340 : 360;
      const start = Math.max(0, Math.floor(-rect.top / rowHeight) - 1);
      const end = Math.min(rows, Math.max(0, Math.ceil((innerHeight - rect.top) / rowHeight) + 1));
      setView((old) =>
        old.start === start && old.end === end && old.columns === columns
          ? old
          : { start, end, columns, rowHeight },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas.current!);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [rows]);
  useEffect(() => {
    if (!endless) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setRows((count) => count + 2);
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel.current!);
    return () => observer.disconnect();
  }, [endless, rows]);
  const moving = !paused && !reducedMotion;
  return (
    <section
      ref={section}
      id="sketchbook"
      className="sketchbook"
      aria-labelledby="sketchbook-title"
      data-edition={edition.seed}
      data-palette={edition.palette}
    >
      <div className="sketchbook-heading">
        <span className="eyebrow">NO STRAIGHT LINES FROM HERE.</span>
        <h2 id="sketchbook-title">
          Good things happen
          <br />
          <em>in the margins.</em>
        </h2>
        <p>A few little things, out in the wild. Keep scrolling. There’s always another.</p>
        <span className="handwritten">go on, get a little lost. ↓</span>
      </div>
      <div className="sketchbook-controls">
        <div className="edition-label">
          <span className="status-dot" />
          <span>EDITION {String(edition.number).padStart(2, '0')}</span>
          <span className="palette-dots" aria-hidden="true">
            {palettes[edition.palette].ink.map((ink) => (
              <i key={ink} style={{ background: ink }} />
            ))}
          </span>
        </div>
        <div className="sketchbook-actions">
          <button
            className="shuffle-button"
            onClick={() =>
              setEdition((old) => ({
                seed: randomSeed(),
                palette:
                  (old.palette + 1 + Math.floor(Math.random() * (palettes.length - 1))) %
                  palettes.length,
                number: old.number + 1,
              }))
            }
          >
            <Icon name="refresh" size={16} />
            Shuffle everything
          </button>
          <button
            className="motion-button"
            aria-pressed={paused || reducedMotion}
            aria-label="Pause sketchbook motion"
            disabled={reducedMotion}
            onClick={() => setPaused(!paused)}
          >
            {moving ? 'Pause ink' : 'Ink is still'}
          </button>
          <a href="#sketchbook-end" onClick={() => setEndless(false)}>
            To the bottom ↓
          </a>
        </div>
      </div>
      <output className="sr-only" aria-label="Sketchbook edition">
        Edition {edition.number}: {palettes[edition.palette].name}
      </output>
      <div
        ref={canvas}
        className="sketchbook-canvas"
        style={{ height: rows * view.rowHeight }}
        data-row-count={rows}
      >
        {Array.from({ length: Math.max(0, view.end - view.start) }, (_, index) => {
          const row = view.start + index;
          return (
            <SketchRow
              key={`${edition.seed}-${row}-${view.columns}`}
              seed={edition.seed}
              row={row}
              palette={edition.palette}
              columns={view.columns}
              rowHeight={view.rowHeight}
              moving={moving}
            />
          );
        })}
      </div>
      <div ref={sentinel} className="sketchbook-sentinel" aria-hidden="true" />
      <div id="sketchbook-end" className="sketchbook-end">
        <span className="handwritten">there’s more where that came from.</span>
        <button
          className="text-link"
          onClick={() => {
            setRows((count) => count + 2);
            setEndless(true);
          }}
        >
          A few more good things <Icon name="arrow" size={16} />
        </button>
      </div>
    </section>
  );
}
