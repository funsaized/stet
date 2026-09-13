import { underline } from "@funsaized/stet";
import "@funsaized/stet/style.css";
import "./review.css";
import plan from "./review-plan.json";

export const reviewModuleSentinel = "STET_REVIEW_MODULE_SENTINEL";
export const reviewCopySentinel = "STET_REVIEW_COPY_SENTINEL";

export function mountReview(): () => void {
  const handle = underline(document.querySelector("#target")!, {
    seed: 22,
    description: `${reviewCopySentinel}:${plan.sentinel}`,
  });
  document.documentElement.dataset.reviewModule = reviewModuleSentinel;
  return () => handle.destroy();
}
