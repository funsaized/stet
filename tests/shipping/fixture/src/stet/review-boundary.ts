declare const __STET_REVIEW_BUILD__: boolean;

export async function mountReviewBoundary(): Promise<() => void> {
  if (!__STET_REVIEW_BUILD__) return () => {};
  const { mountReview } = await import("./review");
  return mountReview();
}
