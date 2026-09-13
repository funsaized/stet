// Adapt to existing controls; annotation state never controls their presence.
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
import "@funsaized/stet/style.css";

// Call update after the application mounts/replaces/removes its destination.
// Call destroy before removing the source control. Reattachment preserves seeds.
export function annotate(target: Element) {
  let cleanup = () => {};
  return {
    update(enabled: boolean, destination: Element | null = null) {
      cleanup(); cleanup = () => {};
      cleanup = attachMarks(target, destination, enabled);
    },
    destroy() { cleanup(); cleanup = () => {}; },
  };
}
