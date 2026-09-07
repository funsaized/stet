// Adapt these sample elements to existing source; retain their semantics and handlers.
import { arrow } from "@funsaized/stet";
import "@funsaized/stet/style.css";

// Call after DOM mount with resolved, unique Elements. Call cleanup before removal.
export function annotate(target: Element, destination: Element) {
  const handle = arrow(target, destination, {"seed":42,"label":"Review this action.","labelOffsetY":-12});
  return { refresh: () => handle.refresh(), destroy: () => handle.destroy() };
}
