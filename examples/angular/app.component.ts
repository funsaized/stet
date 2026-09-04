import { Component } from "@angular/core";
import { StetCircleDirective, StetMarkDirective, StetStickyDirective } from "stet/angular";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [StetCircleDirective, StetMarkDirective, StetStickyDirective],
  template: `
    <h1>Create an account</h1>
    <input [stetCircle]="{ stroke: 'crimson' }" type="email" aria-label="Email" />
    <button [stetSticky]="{ text: 'save this', side: 'right' }">Save</button>
    <span [stetMark]="{ kind: 'right' }">Accessible</span>
  `,
})
export class AppComponent {}
