import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const work = join(root, "test-results/pw08");
const consumer = join(work, "consumer");
const cache = join(work, "npm-cache");
rmSync(consumer, { recursive: true, force: true });
mkdirSync(consumer, { recursive: true });
const run = (command, args, options = {}) =>
  execFileSync(command, args, { encoding: "utf8", ...options });
const [pack] = JSON.parse(
  run("npm", ["pack", "--ignore-scripts", "--json", "--cache", cache, "--pack-destination", work], { cwd: root }),
);
writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "stet-pw08-consumer", private: true, type: "module" }));
run("npm", ["install", join(work, pack.filename), "--ignore-scripts", "--offline", "--no-audit", "--no-fund", "--cache", cache], { cwd: consumer });
const packageRoot = join(consumer, "node_modules/@funsaized/stet");
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
assert(packageJson.exports["./playwright"], "packed Playwright export is missing");
writeFileSync(
  join(work, "env.json"),
  JSON.stringify({
    entryUrl: pathToFileURL(join(packageRoot, "dist/playwright/entry.js")).href,
    tarball: pack.filename,
    bytes: pack.size,
    files: pack.files.length,
  }),
);
console.log(JSON.stringify({ ok: true, tarball: pack.filename, bytes: pack.size, files: pack.files.length }, null, 2));
