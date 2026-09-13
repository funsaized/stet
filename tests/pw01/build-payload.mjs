// Test-only representative payload for the PW-01 loading investigation.
// Bundles the real renderer exactly as a future packed Playwright payload would,
// and hands it to the page under a symbol so no bare global collides with the page.
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const outdir = `${root}test-results/pw01`;
mkdirSync(outdir, { recursive: true });

const result = await build({
  entryPoints: [`${root}src/index.ts`],
  bundle: true,
  format: "iife",
  globalName: "__stetPw01Bundle",
  target: "es2020",
  write: false,
  legalComments: "none",
});

const code = result.outputFiles[0].text;
// The wrapper keeps the esbuild global function-scoped; the only page handoff is
// the symbol, which cannot collide with a source-authored global.
const wrapped = `(() => {\n${code}\nglobalThis[Symbol.for("funsaized.stet.pw01.payload")] = __stetPw01Bundle;\n})();\n`;
writeFileSync(`${outdir}/payload.js`, wrapped);
console.log(`pw01 payload written: ${wrapped.length} bytes`);
