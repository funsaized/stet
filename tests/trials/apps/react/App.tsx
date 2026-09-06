import { useState } from 'react';
export function App({ enabled = true, destination = 1 }: { enabled?: boolean; destination?: number }) {
  const [saved, setSaved] = useState(true);
  return <main><h1>Workspace settings</h1>
    <label htmlFor="workspace-name">Workspace name</label><input id="workspace-name" defaultValue="Sketchbook" required />
    <button id="save" type="submit">Save settings</button>
    <button id="delete" type="button" aria-describedby="native-warning" onClick={() => { if (confirm('Delete saved settings?')) setSaved(false); }}>Delete saved settings</button>
    <p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
    {destination > 0 && <p id="consequences" key={destination}>You can set your preferences again after deletion.</p>}
    <output id="status">{saved ? 'Settings saved' : 'Saved settings deleted'}</output>
    <section><h2>Form examples</h2><label htmlFor="good-email">Email</label><input id="good-email" type="email" />
    <input id="bad-email" placeholder="Email" /></section>
    <section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
  </main>;
}
