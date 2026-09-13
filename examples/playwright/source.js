import { circle } from "/dist/index.js";

await document.fonts.ready;
globalThis.sourceStet = circle(document.querySelector("#total"), {
  seed: 17,
  boil: 0.2,
  description: "Total to confirm",
});
document.documentElement.dataset.state = "source-ready";
