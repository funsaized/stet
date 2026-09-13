// Source-authored Stet in the packed consumer. It imports the ESM browser core
// from inside the installed tarball (`/__pkg__/` is routed to the installed
// package by the spec), exactly as application code would after `npm install`.
import { circle } from "/__pkg__/dist/index.js";

const target = document.getElementById("authored");
const handle = circle(target, { seed: 42, stroke: "#123456" });
const overlay = document.querySelector(".stet-overlay--circle");
const path = overlay?.querySelector("path") ?? null;
overlay?.setAttribute("data-authored", "1");

// Captured references the helper must never disturb.
globalThis.__authored = { handle, overlay, path, d: path?.getAttribute("d") ?? null };
