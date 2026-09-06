// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import { StetCircleDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetCircleDirective],
  template: `
    <button type="button" [stetCircle]='{"seed":42,"description":"Review this action before continuing."}'>Review action</button>
  `,
})
export class AnnotatedAction {}
