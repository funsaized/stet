// Adapt these sample elements to existing source; retain their semantics and handlers.
import { Component } from "@angular/core";
import type { StetHandle } from "@funsaized/stet";
import { StetArrowDirective } from "@funsaized/stet/angular";
// Add @import "@funsaized/stet/style.css"; to the application's global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  imports: [StetArrowDirective],
  template: `
    <p #destination>Consequences of this action</p>
    <button type="button" [stetArrow]='{ to: destination, seed: 42, label: "Review this action.", labelOffsetY: -12 }' [stetOnHandle]="onHandle">Review action</button>
  `,
})
export class AnnotatedAction {
  handle: StetHandle | null = null;
  readonly onHandle = (next: StetHandle | null) => { this.handle = next; };
}
