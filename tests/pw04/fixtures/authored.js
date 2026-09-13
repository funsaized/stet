import { circle } from "/dist/index.js";

const handle = circle(document.querySelector("#authored"), { seed: 77 });
globalThis.__authored = { handle, overlay: document.querySelector(".stet-overlay") };
