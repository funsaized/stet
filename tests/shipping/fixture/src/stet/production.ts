import { circle } from "@funsaized/stet";
import "@funsaized/stet/style.css";

export const productionSentinel = "STET_PRODUCTION_SENTINEL";

export function mountProduction(): () => void {
  const handle = circle(document.querySelector("#target")!, {
    seed: 11,
    description: productionSentinel,
  });
  return () => handle.destroy();
}
