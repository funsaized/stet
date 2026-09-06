// Adapt these sample elements to existing source; retain their semantics and handlers.
import { sticky } from "@funsaized/stet";
import "@funsaized/stet/style.css";

// Call after DOM mount with resolved, unique Elements. Call cleanup before removal.
export function annotate(target: Element) {
  const handle = sticky(target, {"seed":42,"text":"Review the consequences before continuing."});
  return { refresh: () => handle.refresh(), destroy: () => handle.destroy() };
}
