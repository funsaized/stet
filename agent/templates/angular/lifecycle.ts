// Adapt to existing controls; annotation state never controls their presence.
import { Component, ElementRef, afterRenderEffect, input, viewChild } from "@angular/core";
import { arrow, box, circle, sticky, type StetHandle } from "@funsaized/stet";
function attachMarks(target: Element, destination: Element | null | undefined, enabled: boolean) {
  const handles: StetHandle[] = [];
  const destroy = () => { for (const handle of handles.splice(0).reverse()) handle.destroy(); };
  try {
    if (enabled) {
      handles.push(circle(target, { seed: 42, description: "Review this action before continuing." }));
      handles.push(sticky(target, { seed: 43, text: "Read the consequences before continuing." }));
      if (destination) handles.push(arrow(target, destination, { seed: 44, label: "Consequences are explained here.", labelOffsetY: -12 }));
    }
    return destroy;
  } catch (error) { destroy(); throw error; }
}
// Start hidden and animate on show so host code sequences reveal and replay.
export function attachMotionBox(target: Element) {
  return box(target, { seed: 45, visible: false, animate: true });
}
// Reduced motion settles immediately through the runtime; framework cleanup and
// handle.destroy() cancel any active show/replay work.
export async function runMotionSequence(handle: StetHandle | null) {
  if (!handle) return;
  handle.hide();
  if ((await handle.show()).status === "cancelled") return;
  if ((await handle.replay()).status === "cancelled") return;
  handle.hide();
}

// Add @import "@funsaized/stet/style.css"; to the application global stylesheet.
@Component({
  selector: "app-annotated-action",
  standalone: true,
  template: `
    <button #target type="submit">Review action</button>
    @for (key of destination() > 0 ? [destination()] : []; track key) {
      <p #to>Consequences of this action</p>
    }
  `,
})
export class AnnotatedAction {
  readonly enabled = input(true);
  readonly destination = input(0);
  private readonly target = viewChild<ElementRef<HTMLButtonElement>>('target');
  private readonly to = viewChild<ElementRef<HTMLParagraphElement>>('to');
  constructor() {
    afterRenderEffect(onCleanup => {
      const target = this.target()?.nativeElement;
      if (target) onCleanup(attachMarks(target, this.to()?.nativeElement, this.enabled()));
    });
  }
}
