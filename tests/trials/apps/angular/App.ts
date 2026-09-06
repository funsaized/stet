import { Component, input, signal } from '@angular/core';
@Component({ selector: 'app-settings', standalone: true, template: `
<main><h1>Workspace settings</h1>
<label for="workspace-name">Workspace name</label><input id="workspace-name" value="Sketchbook" required />
<button id="save" type="submit">Save settings</button>
<button id="delete" type="button" aria-describedby="native-warning" (click)="remove()">Delete saved settings</button>
<p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
@for (key of destination() > 0 ? [destination()] : []; track key) { <p id="consequences">You can set your preferences again after deletion.</p> }
<output id="status">{{ saved() ? 'Settings saved' : 'Saved settings deleted' }}</output>
<section><h2>Form examples</h2><label for="good-email">Email</label><input id="good-email" type="email" /><input id="bad-email" placeholder="Email" /></section>
<section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
</main>` })
export class App {
  readonly enabled = input(true); readonly destination = input(1); readonly saved = signal(true);
  remove() { if (confirm('Delete saved settings?')) this.saved.set(false); }
}
