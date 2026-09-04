import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const core = ["prng", "rough", "mount", "primitives", "index"]
  .map((name) => readFileSync(new URL(`dist/${name}.js`, import.meta.url)))
  .join("\n");
const css = readFileSync(new URL("style.css", import.meta.url));
const sizes = { core: gzipSync(core).length, css: gzipSync(css).length };
console.log(`core: ${(sizes.core / 1024).toFixed(2)} KB gzip`);
console.log(`css:  ${(sizes.css / 1024).toFixed(2)} KB gzip`);
if (sizes.core > 6 * 1024 || sizes.css > 3 * 1024) process.exitCode = 1;
