import { useRef, useState } from 'react';
import { Mark, Sticky } from '@funsaized/stet/react';
import '@funsaized/stet/style.css';
export function App({ enabled = true, destination = 1 }: { enabled?: boolean; destination?: number }) {
  const [saved, setSaved] = useState(true);
  const goodEmailRef = useRef<HTMLInputElement>(null);
  const badEmailRef = useRef<HTMLInputElement>(null);
  return <main><h1>Workspace settings</h1>
    <style>{`
      .email-review { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px; padding-bottom: 120px; }
      .email-review h2 { grid-column: 1 / -1; }
      .email-review label { grid-column: 1; }
      .email-review input { box-sizing: border-box; width: calc(100% - 40px); min-width: 0; }
      .email-review #good-email { grid-column: 1; grid-row: 3; }
      .email-review #bad-email { grid-column: 2; grid-row: 3; }
      @media (max-width: 600px) {
        .email-review { grid-template-columns: minmax(0, 1fr); }
        .email-review #bad-email { grid-column: 1; grid-row: 4; margin-top: 140px; }
      }
    `}</style>
    <label htmlFor="workspace-name">Workspace name</label><input id="workspace-name" defaultValue="Sketchbook" required />
    <button id="save" type="submit">Save settings</button>
    <button id="delete" type="button" aria-describedby="native-warning" onClick={() => { if (confirm('Delete saved settings?')) setSaved(false); }}>Delete saved settings</button>
    <p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
    {destination > 0 && <p id="consequences" key={destination}>You can set your preferences again after deletion.</p>}
    <output id="status">{saved ? 'Settings saved' : 'Saved settings deleted'}</output>
    <section className="email-review"><h2>Form examples</h2><label htmlFor="good-email">Email</label><input ref={goodEmailRef} id="good-email" type="email" />
    <input ref={badEmailRef} id="bad-email" placeholder="Email" /></section>
    {enabled && <>
      {/* Sticky text supplies each verdict's visible and accessible meaning. */}
      <Mark target={goodEmailRef} kind="right" seed={41} boil={0} />
      <Sticky target={goodEmailRef} seed={42} boil={0} side="bottom" text="Right: associated label stays visible. Keep it." />
      <Mark target={badEmailRef} kind="wrong" seed={43} boil={0} />
      <Sticky target={badEmailRef} seed={44} boil={0} side="bottom" text="Wrong: placeholder only. Add a persistent associated label." />
    </>}
    <section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
  </main>;
}
