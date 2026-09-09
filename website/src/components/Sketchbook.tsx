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
  'plant',
  'fortune',
  'mood',
  'rating',
  'player',
  'progress',
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
function sketchesFor(seed: number, palette: number): Sketch[] {
  const random = randomFrom(seed);
  const deck: SketchKind[] = [...kinds];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const playful = new Set<SketchKind>(['plant', 'fortune', 'mood', 'rating', 'player', 'progress']);
  const selected = [
    ...deck.filter((kind) => !playful.has(kind)).slice(0, 6),
    ...deck.filter((kind) => playful.has(kind)),
  ];
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  return selected.map((kind) => {
    const color = Math.floor(random() * 3);
    return {
      kind,
      ink: palettes[palette].ink[color],
      paper: palettes[palette].paper[color],
      seed: Math.floor(random() * 1e8),
      rotation: random() * 16 - 8,
      width: 235 + random() * 45,
      x: random() * 30 - 15,
      y: random() * 50 + 12,
      boil: 0.2 + random() * 0.5,
      phrase: phrases[Math.floor(random() * phrases.length)],
    };
  });
}

function SketchCard({ sketch, moving }: { sketch: Sketch; moving: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const entered = useRef(false);
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
      case 'fortune':
      case 'rating':
        handles.push(circle(target, { ...options, padding: 9 }));
        break;
      case 'quote':
      case 'input':
      case 'player':
      case 'mood':
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
      case 'plant':
      case 'progress':
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
    const reveal = () => {
      if (entered.current) return;
      entered.current = true;
      if (!moving || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      animation = node.animate(
        [
          { translate: `${sketch.x * 2}px 30px`, opacity: 0 },
          { translate: '0px 0px', opacity: 1 },
        ],
        { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
      const refresh = () => {
        handles.forEach((handle) => handle.refresh());
        if (animation?.playState === 'running') frame = requestAnimationFrame(refresh);
      };
      frame = requestAnimationFrame(refresh);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
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
      data-sketch-kind={sketch.kind}
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
      {sketch.kind === 'plant' && (
        <div className="paper-scrap sketch-plant">
          <span className="sketch-index">A SMALL GROWTH STRATEGY</span>
          <svg viewBox="0 0 120 100" aria-hidden="true">
            <path
              d="M60 72V27M60 49C27 50 22 23 27 20c28-2 36 11 33 29Zm0-13c0-25 26-29 35-24 1 18-14 28-35 24ZM41 73h39l-7 24H48Z"
              fill="var(--sketch-paper)"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          <button data-mark className="sketch-small-button" onClick={() => setCount(count + 1)}>
            {count
              ? `Watered ${count} ${count === 1 ? 'time' : 'times'} ♡`
              : 'A little water, please'}
          </button>
          <span className="handwritten">growth takes practice.</span>
        </div>
      )}
      {sketch.kind === 'fortune' && (
        <div className="sketch-fortune">
          <span className="sketch-index">DEPARTMENT OF NICE SURPRISES</span>
          <span className="fortune-star" aria-hidden="true">
            ✧
          </span>
          <button data-mark className="sketch-small-button" onClick={() => setActive(!active)}>
            {active ? 'One more peek?' : 'Open a tiny fortune'}
          </button>
          <p className="handwritten">
            {active ? 'Someone is glad you exist.' : 'Something good is folded in here.'}
          </p>
        </div>
      )}
      {sketch.kind === 'mood' && (
        <div className="scrap-card sketch-mood">
          <span className="sketch-index">TODAY’S WEATHER, INSIDE</span>
          <p data-mark className="handwritten">
            {['a little cloudy', 'finding the sunshine', 'absolutely radiant'][count]}
          </p>
          <div className="mood-options">
            {['Cloudy', 'Hopeful', 'Radiant'].map((mood, i) => (
              <button
                key={mood}
                aria-label={mood}
                aria-pressed={count === i}
                onClick={() => setCount(i)}
              >
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="16" />
                  <path d="M13 15v2m14-2v2" />
                  <path
                    d={i === 0 ? 'M13 29q7-9 14 0' : i === 1 ? 'M13 26h14' : 'M12 23q8 12 16 0'}
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
      {sketch.kind === 'rating' && (
        <div className="sketch-rating">
          <span className="handwritten tiny-aside">how was that little moment?</span>
          <div className="rating-stars" data-mark>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                aria-label={`Give ${star} ${star === 1 ? 'star' : 'stars'}`}
                aria-pressed={count === star}
                onClick={() => setCount(star)}
              >
                {star <= count ? '★' : '☆'}
              </button>
            ))}
          </div>
          <p className="handwritten">
            {count ? `${count} stars. duly noted!` : 'small joys count, too.'}
          </p>
        </div>
      )}
      {sketch.kind === 'player' && (
        <div className="scrap-card sketch-player">
          <span className="sketch-index">THE SOUNDTRACK TO MAKING</span>
          <div className="player-row">
            <button
              className="record"
              aria-label={active ? 'Pause imaginary record' : 'Play imaginary record'}
              aria-pressed={active}
              onClick={() => setActive(!active)}
            >
              <span>{active ? 'Ⅱ' : '▷'}</span>
            </button>
            <p data-mark>
              Side A:
              <br />
              <em>little victories</em>
            </p>
          </div>
          <span className="handwritten">
            {active ? 'imagine your favorite song…' : 'a record for your imagination.'}
          </span>
        </div>
      )}
      {sketch.kind === 'progress' && (
        <div className="sketch-progress">
          <span className="sketch-index">PROJECT: SOMETHING LOVELY</span>
          <p data-mark className="handwritten">
            {count >= 4 ? 'Look what you made.' : 'A little further than yesterday.'}
          </p>
          <progress aria-label="Little victories progress" max="4" value={count} />
          <button
            className="sketch-small-button"
            onClick={() => setCount(count >= 4 ? 0 : count + 1)}
          >
            {count >= 4 ? 'Begin something new ↻' : 'One small step →'}
          </button>
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
export function Sketchbook() {
  const [edition, setEdition] = useState(() => ({
    seed: 42,
    palette: 0,
    number: 1,
  }));
  const [sketches, setSketches] = useState(() => sketchesFor(edition.seed, edition.palette));
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    // Match the static edition during hydration, then restore per-visit variety.
    const frame = requestAnimationFrame(() => {
      setReducedMotion(media.matches);
      const next = {
        seed: randomSeed(),
        palette: Math.floor(Math.random() * palettes.length),
        number: 1,
      };
      setEdition(next);
      setSketches(sketchesFor(next.seed, next.palette));
    });
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener('change', update);
    };
  }, []);
  const shuffle = () => {
    const next = {
      seed: randomSeed(),
      palette:
        (edition.palette + 1 + Math.floor(Math.random() * (palettes.length - 1))) % palettes.length,
      number: edition.number + 1,
    };
    setEdition(next);
    setSketches(sketchesFor(next.seed, next.palette));
  };
  const moving = !paused && !reducedMotion;
  return (
    <section
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
        <p>Twelve little things, out in the wild. A small collection of happy accidents.</p>
        <span className="handwritten">take a little wander. ↓</span>
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
          <button className="shuffle-button" onClick={shuffle}>
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
          <a href="#sketchbook-end">To the bottom ↓</a>
        </div>
      </div>
      <output className="sr-only" aria-label="Sketchbook edition">
        Edition {edition.number}: {palettes[edition.palette].name}
      </output>
      <div className="sketchbook-canvas" data-example-count={sketches.length}>
        {sketches.map((sketch) => (
          <SketchCard key={`${edition.seed}-${sketch.kind}`} sketch={sketch} moving={moving} />
        ))}
      </div>
      <div id="sketchbook-end" className="sketchbook-end">
        <span className="handwritten">that’s the collection. small things, big feelings.</span>
      </div>
    </section>
  );
}
