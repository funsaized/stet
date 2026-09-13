import { circle } from "@funsaized/stet";

// Durable, published annotation: this mark belongs in application source.
await document.fonts.ready;
globalThis.sourceHandle = circle(document.querySelector("#password"), {
  seed: 17,
  boil: 0.2,
  description: "New minimum: 12 characters",
});
document.documentElement.dataset.sourceState = "ready";
