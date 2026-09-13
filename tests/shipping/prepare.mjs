import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const work = join(root, "test-results/shipping");
const consumer = join(work, "consumer");
const cache = join(work, "npm-cache");
const fixture = join(root, "tests/shipping/fixture");
const vite = join(root, "node_modules/vite/bin/vite.js");
const run = (command, args, options = {}) =>
  execFileSync(command, args, { encoding: "utf8", ...options });

rmSync(consumer, { recursive: true, force: true });
mkdirSync(consumer, { recursive: true });
cpSync(fixture, consumer, { recursive: true });
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ name: "stet-shipping-consumer", private: true, type: "module" }),
);
const [pack] = JSON.parse(
  run("npm", ["pack", "--ignore-scripts", "--json", "--cache", cache, "--pack-destination", work], {
    cwd: root,
  }),
);
run(
  "npm",
  [
    "install",
    join(work, pack.filename),
    "--ignore-scripts",
    "--offline",
    "--no-audit",
    "--no-fund",
    "--cache",
    cache,
  ],
  { cwd: consumer },
);

const builds = [
  ["production", "vite.production.config.mjs", "production"],
  ["preview-customer", "vite.preview.config.mjs", "production"],
  ["preview-customer-map", "vite.preview.config.mjs", "production", "true"],
  ["preview-preview", "vite.preview.config.mjs", "stet-preview"],
  ["local-build", "vite.local.config.mjs", "production"],
  ["local-build-map", "vite.local.config.mjs", "production", "true"],
  ["disabled", "vite.disabled.config.mjs", "production"],
  ["mixed-customer", "vite.mixed-preview.config.mjs", "production"],
  ["mixed-customer-map", "vite.mixed-preview.config.mjs", "production", "true"],
  ["mixed-preview", "vite.mixed-preview.config.mjs", "stet-preview"],
];
for (const [name, config, mode, sourcemap] of builds) {
  const out = join(consumer, "builds", name);
  run(
    process.execPath,
    [
      vite,
      "build",
      "--config",
      join(consumer, config),
      "--mode",
      mode,
      "--outDir",
      out,
      "--emptyOutDir",
      ...(sourcemap ? ["--sourcemap", sourcemap] : []),
    ],
    { cwd: consumer, stdio: "inherit" },
  );
}
writeFileSync(
  join(work, "env.json"),
  JSON.stringify(
    {
      tarball: pack.filename,
      bytes: pack.size,
      files: pack.files.length,
      builds: builds.map(([name]) => name),
    },
    null,
    2,
  ),
);
console.log(JSON.stringify(JSON.parse(readFileSync(join(work, "env.json"), "utf8")), null, 2));
