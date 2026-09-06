// Adapt these sample elements to existing source; retain their semantics and handlers.
import { mark } from "@funsaized/stet";
import "@funsaized/stet/style.css";

// Call after DOM mount with resolved, unique Elements. Call cleanup before removal.
export function annotate(target: Element) {
  const handle = mark(target, "wrong", {"seed":42,"description":"Review this action before continuing."});
  return { refresh: () => handle.refresh(), destroy: () => handle.destroy() };
}
