import { Component, Directive, Input } from "@angular/core";
import type { StetHandle } from "../../../../src/index.js";
import type { FutureStetOptions } from "./adapter-types.js";

@Directive({ selector: "[stetCircle]", standalone: true })
export class StetCircleContractDirective {
  @Input() stetCircle: FutureStetOptions = {};
  @Input() stetOnHandle?: (handle: StetHandle | null) => void;
}

@Component({
  standalone: true,
  imports: [StetCircleContractDirective],
  template: `<button [stetCircle]="{ visible: annotationVisible }" [stetOnHandle]="onStetHandle">
    Save
  </button>`,
})
export class Example {
  annotationVisible = false;
  handle: StetHandle | null = null;
  readonly onStetHandle = (next: StetHandle | null) => {
    this.handle = next;
  };
}
