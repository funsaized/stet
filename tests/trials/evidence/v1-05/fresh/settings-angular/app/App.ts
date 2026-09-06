import { Component, ElementRef, afterRenderEffect, input, signal, viewChild } from '@angular/core';
import { circle } from '@funsaized/stet';
@Component({ selector: 'app-settings', standalone: true, template: `
<main><h1>Workspace settings</h1>
<label for="workspace-name">Workspace name</label><input id="workspace-name" value="Sketchbook" required />
<button id="save" type="submit">Save settings</button>
<button #deleteButton id="delete" type="button" aria-describedby="native-warning" (click)="remove()">Delete saved settings</button>
<p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
@for (key of destination() > 0 ? [destination()] : []; track key) { <p id="consequences">You can set your preferences again after deletion.</p> }
<output id="status">{{ saved() ? 'Settings saved' : 'Saved settings deleted' }}</output>
<section><h2>Form examples</h2><label for="good-email">Email</label><input id="good-email" type="email" /><input id="bad-email" placeholder="Email" /></section>
<section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
</main>` })
export class App {
  readonly enabled = input(true); readonly destination = input(1); readonly saved = signal(true);
  private readonly deleteButton = viewChild<ElementRef<HTMLButtonElement>>('deleteButton');

  constructor() {
    // Only the annotation follows enabled; the native button stays mounted.
    // Stet CSS is already imported globally by build.mjs.
    afterRenderEffect(onCleanup => {
      const enabled = this.enabled();
      const target = this.deleteButton()?.nativeElement;
      if (!enabled || !target) return;
      const handle = circle(target, {
        seed: 42,
        boil: 0,
        resketchOnHover: false,
        description: 'You will be asked to confirm before continuing.',
      });
      onCleanup(() => handle.destroy());
    });
  }

  remove() { if (confirm('Delete saved settings?')) this.saved.set(false); }
}
