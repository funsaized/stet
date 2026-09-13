// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import type { StetHandle } from "@funsaized/stet";
import { StetBoxDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetBoxDirective],
  template: `
    <button type="button" [stetBox]='{"seed":42,"description":"Review this action before continuing."}' [stetOnHandle]="onHandle">Review action</button>
  `,
})
export class AnnotatedAction {
  handle: StetHandle | null = null;
  readonly onHandle = (next: StetHandle | null) => { this.handle = next; };
}
