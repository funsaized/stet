import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Arrow, Circle, Highlight, Mark, Sticky, Underline } from '@funsaized/stet/react';
import { kinds, descriptions, type Kind } from '../constants';
import { Icon } from './Icon';
import { MarkGlyph } from './MarkGlyph';
import { Code } from './Code';
import { CopyButton } from './CopyButton';
export function Playground() {
  const [kind, setKind] = useState<Kind>('circle'),
    [color, setColor] = useState('#c84935'),
    [roughness, setRoughness] = useState(1.3),
    [boil, setBoil] = useState(false),
    [seed, setSeed] = useState(23);
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
  const options = {
    target,
    stroke: color,
    roughness,
    seed,
    boil: boil ? 0.3 : 0,
    width: 2.5,
    resketchOnHover: true,
  };
  const code =
    kind === 'arrow'
      ? `arrow(start, end, {\n  stroke: "${color}",\n  label: "this way",\n  roughness: ${roughness},\n  boil: ${boil ? '0.3' : '0'}\n});`
      : `${kind}(element, ${kind === 'mark' ? '"right", ' : ''}{\n  ${kind === 'sticky' ? 'text: "A little note, just for you.",\n  stroke: "#34372f",\n  ' : ''}${kind === 'highlight' || kind === 'sticky' ? 'fill' : 'stroke'}: "${kind === 'sticky' ? paperColor : color}",\n  roughness: ${roughness},\n  boil: ${boil ? '0.3' : '0'}\n});`;
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
            {kind === 'circle' && <Circle {...options} padding={12} />}
            {kind === 'underline' && <Underline {...options} />}
            {kind === 'highlight' && <Highlight {...options} fill={color} />}
            {kind === 'arrow' && (
              <Arrow
                from={from}
                to={target}
                stroke={color}
                roughness={roughness}
                seed={seed}
                boil={boil ? 0.3 : 0}
                label="this way"
              />
            )}
            {kind === 'sticky' && (
              <Sticky
                {...options}
                stroke="#34372f"
                fill={paperColor}
                text="A little note, just for you."
                side="bottom"
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
