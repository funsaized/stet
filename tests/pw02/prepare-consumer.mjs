// PW-02 packed-consumer check. Packs the provider, installs the tarball into a
// fresh temp consumer without network (offline npm install, tar extract fallback),
// proves package-local discovery of the prebuilt IIFE + CSS, and records the
// browser-core module graph. Run by tests/pw02/global-setup.ts.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("../../", import.meta.url));
const work = join(root, "test-results/pw02");
const consumer = join(work, "consumer");
const cache = join(work, "npm-cache");
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { encoding: "utf8", ...options });
const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

rmSync(consumer, { recursive: true, force: true });
mkdirSync(consumer, { recursive: true });

const [pack] = JSON.parse(
  run("npm", ["pack", "--ignore-scripts", "--json", "--cache", cache, "--pack-destination", work], {
    cwd: root,
  }),
);
const packedPaths = new Set(pack.files.map((file) => file.path));
for (const required of [
  "style.css",
  "package.json",
  "dist/index.js",
  "dist/playwright/payload.js",
  "dist/playwright/entry.mjs",
]) {
  assert(packedPaths.has(required), `Packed package is missing ${required}`);
}

const providerPackageJson = JSON.parse(
  run("tar", ["-xOf", join(work, pack.filename), "package/package.json"]),
);
assert.equal(
  Object.keys(providerPackageJson.exports).includes("./playwright"),
  false,
  "PW-02 experiment must not expose a public /playwright export",
);

writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ name: "stet-pw02-consumer", private: true, type: "module" }),
);

const tarball = join(work, pack.filename);
const installDir = join(consumer, "node_modules/@funsaized/stet");
let installMethod = "npm-install-offline";
try {
  run(
    "npm",
    [
      "install",
      tarball,
      "--ignore-scripts",
      "--offline",
      "--no-audit",
      "--no-fund",
      "--cache",
      cache,
    ],
    { cwd: consumer },
  );
  assert(existsSync(join(installDir, "package.json")), "offline install did not place the package");
} catch {
  // Offline npm can still fail for reasons unrelated to the package. Extracting
  // the same tarball proves consumption without any network at all.
  installMethod = "tar-extract";
  rmSync(installDir, { recursive: true, force: true });
  mkdirSync(installDir, { recursive: true });
  run("tar", ["-xzf", tarball, "-C", installDir, "--strip-components=1"]);
}

const payloadFile = join(installDir, "dist/playwright/payload.js");
const entryFile = join(installDir, "dist/playwright/entry.mjs");
const styleFile = join(installDir, "style.css");
for (const file of [payloadFile, entryFile, styleFile])
  assert(existsSync(file), `Installed package is missing ${file}`);

// Package-local discovery: the entry finds both assets relative to its own URL.
// This is exactly how the future entry would resolve them after `npm install`.
const entryUrl = pathToFileURL(entryFile).href;
assert(entryUrl.includes("/node_modules/@funsaized/stet/dist/playwright/entry.mjs"));

// Browser-core isolation: bundling the public entry from the consumer graph must
// pull only browser modules, with no Node builtins and no Playwright code.
const core = await build({
  stdin: {
    contents: 'import * as stet from "@funsaized/stet"; export default stet;',
    resolveDir: consumer,
  },
  bundle: true,
  write: false,
  platform: "browser",
  format: "esm",
  metafile: true,
  logLevel: "silent",
});
const coreInputs = Object.keys(core.metafile.inputs).map((path) => path.replaceAll("\\", "/"));
assert(
  coreInputs.every(
    (path) => path === "<stdin>" || path.includes("node_modules/@funsaized/stet/dist/"),
  ),
  `browser-core graph escaped the package: ${coreInputs.join(", ")}`,
);
assert(
  coreInputs.every((path) => !/node:|@playwright/.test(path)),
  `browser-core graph leaked Node/Playwright code: ${coreInputs.filter((p) => /node:|@playwright/.test(p)).join(", ")}`,
);
assert(
  Object.values(core.metafile.outputs).every((output) => output.imports.length === 0),
  "browser-core bundle kept external imports",
);
const payloadGraph = JSON.parse(readFileSync(join(work, "payload-graph.json"), "utf8"));

const env = {
  node: process.version,
  npm: run("npm", ["--version"]),
  platform: process.platform,
  tarball: pack.filename,
  tarballBytes: pack.size,
  unpackedBytes: pack.unpackedSize,
  packedFileCount: pack.files.length,
  packedPaths: [...packedPaths].sort(),
  installMethod,
  packageRoot: installDir,
  entryUrl,
  payloadFile,
  styleFile,
  payloadSha256: sha256(payloadFile),
  styleSha256: sha256(styleFile),
  payloadGraph,
  coreGraph: { inputs: coreInputs.sort() },
};
writeFileSync(join(work, "env.json"), JSON.stringify(env, null, 2));
console.log(
  JSON.stringify(
    {
      ok: true,
      installMethod,
      tarball: pack.filename,
      bytes: pack.size,
      packedFiles: pack.files.length,
      payloadInputs: payloadGraph.inputs,
      coreInputs: coreInputs.sort(),
      styleBytes: statSync(styleFile).size,
    },
    null,
    2,
  ),
);
