import { circle, type StetHandle } from '@funsaized/stet';

// Stet's stylesheet is imported once by the existing build entry.
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
  const deleteButtons = host.querySelectorAll<HTMLButtonElement>('#delete');
  if (deleteButtons.length !== 1) throw new Error('Expected one Delete saved settings button');
  const deleteButton = deleteButtons[0];
  let focalMark: StetHandle | undefined;
  let destroyed = false;

  function syncAnnotation(enabled: boolean) {
    if (!enabled) {
      focalMark?.destroy();
      focalMark = undefined;
    } else if (!focalMark) {
      // The persistent native warning supplies the consequence; this adds only
      // the confirmation step. No annotation depends on the optional paragraph.
      focalMark = circle(deleteButton, {
        seed: 42,
        boil: 0,
        description: 'Asks for confirmation before continuing.',
      });
    } else {
      focalMark.refresh();
    }
  }

  syncAnnotation(true);
  return {
    update(enabled: boolean, destination: number) {
      if (destroyed) return;
      host.querySelector('#consequences')?.remove();
      if (destination) { const p = document.createElement('p'); p.id = 'consequences'; p.textContent = 'You can set your preferences again after deletion.'; host.querySelector('#native-warning')!.after(p); }
      syncAnnotation(enabled);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      syncAnnotation(false);
      host.replaceChildren();
    },
  };
}
