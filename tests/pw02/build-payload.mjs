// PW-02 proposed payload build experiment. Test-only; output goes to the
// gitignored `dist/playwright/` directory so `npm pack` (which ships `dist`)
// carries it into the tarball without any package.json/exports change.
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../../", import.meta.url));
const outdir = `${root}dist/playwright`;
const evidence = `${root}test-results/pw02`;
rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });
mkdirSync(evidence, { recursive: true });

const result = await build({
  entryPoints: [`${root}src/index.ts`],
  bundle: true,
  format: "iife",
  globalName: "__stetPw02Bundle",
  target: "es2020",
  write: false,
  legalComments: "none",
  metafile: true,
});

const inputs = Object.keys(result.metafile.inputs).map((path) => path.replaceAll("\\", "/"));
assert(
  inputs.every((path) => /(^|\/)src\//.test(path) && !path.includes("node_modules")),
  `payload graph must contain only browser source: ${inputs.join(", ")}`,
);
assert(
  inputs.every((path) => !/node:|@playwright/.test(path)),
  `payload graph leaked Node/Playwright code: ${inputs.filter((path) => /node:|@playwright/.test(path)).join(", ")}`,
);

const code = result.outputFiles[0].text;
// The wrapper keeps the esbuild global function-scoped and hands the page only a
// symbol. Re-loading the payload (a second session) reuses the existing runtime
// and handle map instead of clobbering another session's handles.
const wrapped =
  `(() => {\n${code}\n` +
  `const __stetKey = Symbol.for(${JSON.stringify("funsaized.stet.playwright.payload")});\n` +
  `globalThis[__stetKey] = globalThis[__stetKey] || { runtime: __stetPw02Bundle, handles: new Map(), next: 1 };\n` +
  `})();\n`;
writeFileSync(`${outdir}/payload.js`, wrapped);
copyFileSync(`${root}tests/pw02/emulated-entry.mjs`, `${outdir}/entry.mjs`);
writeFileSync(`${evidence}/payload-graph.json`, JSON.stringify({ inputs: inputs.sort() }, null, 2));
console.log(
  JSON.stringify({ ok: true, payloadBytes: wrapped.length, payloadInputs: inputs.sort() }, null, 2),
);
