// Source-authored Stet: a normal page module using the package ESM entry.
import { circle } from "/dist/index.js";

const target = document.getElementById("authored");
const handle = circle(target, { seed: 42, stroke: "#123456" });
const overlay = document.querySelector("#authored ~ .stet-overlay--circle, .stet-overlay--circle");
const path = overlay?.querySelector("path") ?? null;
overlay?.setAttribute("data-authored", "1");

// Captured references the helper must not disturb.
globalThis.__authored = { handle, overlay, path, d: path?.getAttribute("d") ?? null };
