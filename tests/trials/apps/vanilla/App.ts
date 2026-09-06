export function mount(host: HTMLElement) {
  host.innerHTML = `<main><h1>Workspace settings</h1>
<label for="workspace-name">Workspace name</label><input id="workspace-name" value="Sketchbook" required />
<button id="save" type="submit">Save settings</button>
<button id="delete" type="button" aria-describedby="native-warning">Delete saved settings</button>
<p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
<p id="consequences">You can set your preferences again after deletion.</p>
<output id="status">Settings saved</output>
<section><h2>Form examples</h2><label for="good-email">Email</label><input id="good-email" type="email" /><input id="bad-email" placeholder="Email" /></section>
<section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section></main>`;
  host.querySelector('#delete')!.addEventListener('click', () => { if (confirm('Delete saved settings?')) host.querySelector('#status')!.textContent = 'Saved settings deleted'; });
  return {
    update(enabled: boolean, destination: number) {
      host.querySelector('#consequences')?.remove();
      if (destination) { const p = document.createElement('p'); p.id = 'consequences'; p.textContent = 'You can set your preferences again after deletion.'; host.querySelector('#native-warning')!.after(p); }
    },
    destroy() { host.replaceChildren(); },
  };
}
