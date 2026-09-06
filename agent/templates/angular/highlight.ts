// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import { StetHighlightDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetHighlightDirective],
  template: `
    <button type="button" [stetHighlight]='{"seed":42,"description":"Review this action before continuing."}'>Review action</button>
  `,
})
export class AnnotatedAction {}
