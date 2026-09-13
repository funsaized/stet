import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

// Legacy raw-concatenation baselines. Kept byte-for-byte comparable with the
// 7 KiB core / 3 KiB CSS guards from 0.0.1; do not fold bundle output in here.
const core = ["prng", "rough", "mount", "primitives", "index"]
  .map((name) => readFileSync(new URL(`dist/${name}.js`, import.meta.url)))
  .join("\n");
const css = readFileSync(new URL("style.css", import.meta.url));
const sizes = { core: gzipSync(core).length, css: gzipSync(css).length };
const kb = (bytes) => (bytes / 1024).toFixed(2);
console.log(`core: ${kb(sizes.core)} KB gzip (${sizes.core} B)`);
console.log(`css:  ${kb(sizes.css)} KB gzip (${sizes.css} B)`);

// Browser ESM consumer bundles built with the installed esbuild from the fresh
// dist output. Host framework peers are external so their bytes are not
// attributed to Stet. Each adapter figure is the total adapter-consumer bundle
// (Stet runtime + that adapter's glue), not adapter-only bytes.
const root = fileURLToPath(new URL(".", import.meta.url));
const consumers = {
  "minimal circle": {
    source: 'import { circle } from "./dist/index.js"; console.log(circle);',
    external: [],
  },
  "full core": {
    source: 'import * as stet from "./dist/index.js"; console.log(stet);',
    external: [],
  },
  react: {
    source: 'import * as stet from "./dist/react.js"; console.log(stet);',
    external: ["react"],
  },
  vue: { source: 'import * as stet from "./dist/vue.js"; console.log(stet);', external: [] },
  svelte: { source: 'import * as stet from "./dist/svelte.js"; console.log(stet);', external: [] },
  angular: {
    source: 'import * as stet from "./dist/angular.js"; console.log(stet);',
    external: ["@angular/core"],
  },
};
const browserModules = new Set(
  ["prng", "rough", "mount", "primitives", "index", "react", "vue", "svelte", "angular"].map(
    (name) => `dist/${name}.js`,
  ),
);
const bundles = {};
for (const [label, { source, external }] of Object.entries(consumers)) {
  const result = await build({
    stdin: { contents: source, resolveDir: root, sourcefile: `${label}.js` },
    bundle: true,
    write: false,
    minify: true,
    platform: "browser",
    format: "esm",
    external,
    metafile: true,
  });
  const unexpectedInputs = Object.keys(result.metafile.inputs)
    .map((path) => path.replaceAll("\\", "/"))
    .filter((path) => path !== `${label}.js` && !browserModules.has(path));
  if (unexpectedInputs.length)
    throw new Error(`${label} bundle pulled in unexpected code: ${unexpectedInputs.join(", ")}`);
  const outputImports = [
    ...new Set(
      Object.values(result.metafile.outputs).flatMap((output) =>
        output.imports.map(({ path }) => path),
      ),
    ),
  ].sort();
  if (JSON.stringify(outputImports) !== JSON.stringify([...external].sort()))
    throw new Error(`${label} bundle externals changed: ${outputImports.join(", ")}`);
  bundles[label] = gzipSync(result.outputFiles[0].contents).length;
}
if (!(bundles["minimal circle"] < bundles["full core"]))
  throw new Error("tree-shaking regressed: minimal circle is not smaller than full core");
console.log("browser bundles (esbuild ESM, minified gzip):");
for (const [label, bytes] of Object.entries(bundles))
  console.log(`${label}: ${kb(bytes)} KB (${bytes} B)`);

if (sizes.core > 7 * 1024 || sizes.css > 3 * 1024) process.exitCode = 1;
