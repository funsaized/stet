// Production build for the optional Playwright entry.
//
// Bundles the browser core as a classic/IIFE payload into `dist/playwright/`
// beside the tsc-emitted Node entry. The wrapper keeps the esbuild namespace
// function-scoped and hands the page only a symbol, so loading the payload from a
// second session reuses the existing runtime and handle map.
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../", import.meta.url));
const outdir = `${root}dist/playwright`;
mkdirSync(outdir, { recursive: true });
rmSync(`${outdir}/entry.mjs`, { force: true });

const result = await build({
  entryPoints: [`${root}src/index.ts`],
  bundle: true,
  format: "iife",
  globalName: "__stetPlaywrightBundle",
  target: "es2020",
  write: false,
  legalComments: "none",
  metafile: true,
});

const inputs = Object.keys(result.metafile.inputs).map((path) => path.replaceAll("\\", "/"));
if (!inputs.every((path) => /(^|\/)src\//.test(path) && !path.includes("node_modules")))
  throw new Error(`payload graph must contain only browser source: ${inputs.join(", ")}`);
if (inputs.some((path) => /node:|@playwright/.test(path)))
  throw new Error(
    `payload graph leaked Node/Playwright code: ${inputs.filter((path) => /node:|@playwright/.test(path)).join(", ")}`,
  );

const code = result.outputFiles[0].text;
const wrapped =
  `(() => {\n${code}\n` +
  `const __stetKey = Symbol.for(${JSON.stringify("funsaized.stet.playwright.payload")});\n` +
  `globalThis[__stetKey] = globalThis[__stetKey] || { runtime: __stetPlaywrightBundle, handles: new Map(), next: 1 };\n` +
  `})();\n`;
writeFileSync(`${outdir}/payload.js`, wrapped);

const graph = { inputs: inputs.sort() };
console.log(
  JSON.stringify(
    {
      ok: true,
      payloadBytes: wrapped.length,
      payloadSha256: createHash("sha256").update(wrapped).digest("hex"),
      payloadInputs: graph.inputs,
    },
    null,
    2,
  ),
);
