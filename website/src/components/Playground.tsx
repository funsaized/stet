import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Arrow, Circle, Highlight, Mark, Sticky, Underline } from '@funsaized/stet/react';
import { kinds, descriptions, type Kind } from '../constants';
import { Icon } from './Icon';
import { MarkGlyph } from './MarkGlyph';
import { Code } from './Code';
import { capabilities } from '../showcase/canonical';
import { CopyButton } from './CopyButton';
export function Playground() {
  const [kind, setKind] = useState<Kind>('circle'),
    [color, setColor] = useState('#c84935'),
    [roughness, setRoughness] = useState(1.3),
    [boil, setBoil] = useState(false),
    [seed, setSeed] = useState(23),
    [width, setWidth] = useState(2.5),
    [padding, setPadding] = useState(12),
    [curvature, setCurvature] = useState(0.16),
    [side, setSide] = useState<'auto' | 'top' | 'right' | 'bottom' | 'left'>('bottom'),
    [label, setLabel] = useState('this way'),
    [hover, setHover] = useState(false);
  function reset() {
    setKind('circle');
    setColor('#c84935');
    setRoughness(1.3);
    setBoil(false);
    setSeed(23);
    setWidth(2.5);
    setPadding(12);
    setCurvature(0.16);
    setSide('bottom');
    setLabel('this way');
    setHover(false);
  }
  const target = useRef<HTMLSpanElement>(null),
    from = useRef<HTMLSpanElement>(null);
  const paperColor = (
    {
      '#c84935': '#f5d5c9',
      '#426650': '#dce7ce',
      '#416ba0': '#d7e5f0',
      '#e3b937': '#f6e89d',
      '#38352f': '#e5e1d6',
    } as Record<string, string>
  )[color];
  const shared = {
    stroke: color,
    roughness,
    seed,
    boil: boil ? 0.8 : 0,
    width,
    resketchOnHover: hover,
  };
  const rendered = {
    ...shared,
    ...(kind === 'circle' ? { padding } : {}),
    ...(kind === 'highlight' ? { fill: color } : {}),
    ...(kind === 'sticky'
      ? {
          stroke: '#34372f',
          fill: paperColor,
          text: 'A little note, just for you.',
          side,
        }
      : {}),
    ...(kind === 'arrow' ? { curvature, label } : {}),
    ...(kind === 'mark' ? { description: 'Looking good' } : {}),
  };
  const options = { target, ...shared };
  const args = kind === 'arrow' ? 'start, end' : 'element';
  const code = `import { ${kind} } from "@funsaized/stet";\nimport "@funsaized/stet/style.css";\n\n// Call after DOM mount; retain and invoke cleanup before unmount.\nexport function annotate(${args}) {\n  const annotation = ${kind}(${args}${kind === 'mark' ? ', "right"' : ''}, {\n${Object.entries(
    rendered,
  )
    .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
    .join(',\n')}\n  });\n  return () => annotation.destroy();\n}`;
  return (
    <section id="playground" className="section playground-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / THE PENCIL CASE</span>
          <h1>
            Six ways to <em>leave a mark.</em>
          </h1>
          <p>A small toolkit for all the things you want to say.</p>
        </div>
        <span className="handwritten side-note">
          a little imperfect.
          <br />
          entirely on purpose. <span>↙</span>
        </span>
      </div>
      <div className="playground">
        <div className="primitive-tabs" role="tablist" aria-label="Annotation type">
          {kinds.map((k) => (
            <button
              role="tab"
              id={`tab-${k}`}
              aria-controls="primitive-panel"
              aria-selected={kind === k}
              tabIndex={kind === k ? 0 : -1}
              key={k}
              onClick={() => setKind(k)}
              onKeyDown={(e) => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();
                const index =
                  e.key === 'Home'
                    ? 0
                    : e.key === 'End'
                      ? kinds.length - 1
                      : (kinds.indexOf(k) + (e.key === 'ArrowRight' ? 1 : -1) + kinds.length) %
                        kinds.length;
                setKind(kinds[index]);
                document.getElementById(`tab-${kinds[index]}`)?.focus();
              }}
            >
              <MarkGlyph kind={k} />
              <span>{k}</span>
            </button>
          ))}
        </div>
        <div
          className="playground-body"
          id="primitive-panel"
          role="tabpanel"
          aria-labelledby={`tab-${kind}`}
        >
          <div className="playground-preview">
            <div className="preview-topline">
              <span>LIVE PREVIEW</span>
              <button onClick={() => setSeed((s) => s + 1)}>
                <Icon name="refresh" size={14} /> Resketch
              </button>
            </div>
            <div className={`specimen specimen-${kind}`}>
              <span className="arrow-start" ref={from}>
                {kind === 'arrow' ? 'a little nudge' : ''}
              </span>
              <span className="specimen-text" ref={target}>
                Look at you go.
              </span>
            </div>
            <div className="preview-caption">
              <h3>{descriptions[kind][0]}</h3>
              <p>{descriptions[kind][1]}</p>
            </div>
            {kind === 'circle' && <Circle {...options} padding={padding} />}
            {kind === 'underline' && <Underline {...options} />}
            {kind === 'highlight' && <Highlight {...options} fill={color} />}
            {kind === 'arrow' && (
              <Arrow
                from={from}
                to={target}
                stroke={color}
                roughness={roughness}
                seed={seed}
                boil={boil ? 0.8 : 0}
                label={label}
                width={width}
                curvature={curvature}
                resketchOnHover={hover}
              />
            )}
            {kind === 'sticky' && (
              <Sticky
                {...options}
                stroke="#34372f"
                fill={paperColor}
                text="A little note, just for you."
                side={side}
              />
            )}
            {kind === 'mark' && <Mark {...options} kind="right" description="Looking good" />}
          </div>
          <div className="playground-settings">
            <div className="settings-title">
              <span>MAKE IT YOURS</span>
              <Icon name="spark" size={15} />
            </div>
            <fieldset className="color-field">
              <legend>{kind === 'sticky' ? 'Paper color' : 'Ink color'}</legend>
              <div className="swatches">
                {[
                  ['#c84935', 'Editor red'],
                  ['#426650', 'Forest green'],
                  ['#416ba0', 'Notebook blue'],
                  ['#e3b937', 'Highlighter yellow'],
                  ['#38352f', 'Graphite'],
                ].map(([hex, label]) => (
                  <button
                    key={hex}
                    title={label}
                    aria-label={label}
                    aria-pressed={color === hex}
                    style={{ background: hex }}
                    className={color === hex ? 'selected' : ''}
                    onClick={() => setColor(hex)}
                  >
                    {color === hex && <Icon name="check" size={14} />}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="range-label" htmlFor="roughness">
              Roughness <output>{roughness.toFixed(1)}</output>
            </label>
            <input
              id="roughness"
              aria-label="Roughness"
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={roughness}
              onChange={(e) => setRoughness(Number(e.target.value))}
            />
            <div className="range-hints">
              <span>Steady hand</span>
              <span>Extra scribbly</span>
            </div>
            <div className="motion-control">
              <div>
                Give it a little life<span>Subtle, animated ink</span>
              </div>
              <button
                className={`toggle ${boil ? 'on' : ''}`}
                role="switch"
                aria-checked={boil}
                aria-label="Animate ink"
                onClick={() => setBoil(!boil)}
              >
                <span />
              </button>
            </div>
            <details className="playground-more">
              <summary>Placement & reproducibility</summary>
              {kind !== 'sticky' && kind !== 'highlight' && (
                <label>
                  Stroke width{' '}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                </label>
              )}
              <label>
                Seed{' '}
                <input
                  type="number"
                  min="0"
                  max="4294967295"
                  value={seed}
                  onChange={(e) =>
                    setSeed(Math.max(0, Math.min(4294967295, Number(e.target.value))))
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={hover}
                  onChange={(e) => setHover(e.target.checked)}
                />{' '}
                Resketch on hover
              </label>
              {kind === 'circle' && (
                <label>
                  Padding{' '}
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                  />
                </label>
              )}
              {kind === 'arrow' && (
                <>
                  <label>
                    Curvature{' '}
                    <input
                      type="range"
                      min="-0.8"
                      max="0.8"
                      step="0.01"
                      value={curvature}
                      onChange={(e) => setCurvature(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Arrow label <input value={label} onChange={(e) => setLabel(e.target.value)} />
                  </label>
                </>
              )}
              {kind === 'sticky' && (
                <label>
                  Preferred side{' '}
                  <select value={side} onChange={(e) => setSide(e.target.value as typeof side)}>
                    {capabilities.primitives.sticky.options.properties.side.enum.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              )}
              <button onClick={reset}>Reset playground</button>
            </details>
            <div className="mini-code">
              <div>
                <span>JavaScript</span>
                <CopyButton value={code} />
              </div>
              <Code text={code} />
            </div>
          </div>
        </div>
      </div>
      <div className="playground-footnote">
        <span>↑ These are real Stet marks, drawn on real HTML.</span>
        <Link to="/docs" hash="api">
          Meet the API <Icon name="arrow" size={15} />
        </Link>
      </div>
    </section>
  );
}
