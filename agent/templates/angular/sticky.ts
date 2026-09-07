// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import { StetStickyDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetStickyDirective],
  template: `
    <button type="button" [stetSticky]='{"seed":42,"text":"Review the consequences before continuing.","offsetY":8}'>Review action</button>
  `,
})
export class AnnotatedAction {}
