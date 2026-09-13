import { mountApp } from "../../src/app";
import { mountProduction } from "../../src/stet/production";
import { mountReviewBoundary } from "../../src/stet/review-boundary";
mountApp();
mountProduction();
void mountReviewBoundary();
