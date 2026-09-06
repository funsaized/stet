// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import { StetArrowDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetArrowDirective],
  template: `
    <p #destination>Consequences of this action</p>
    <button type="button" [stetArrow]='{ to: destination, seed: 42, label: "Review this action." }'>Review action</button>
  `,
})
export class AnnotatedAction {}
