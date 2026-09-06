import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const directory = ".release-artifacts/package";
const manifest = JSON.parse(await readFile(`${directory}/package.json`, "utf8"));
if (!process.env.NODE_AUTH_TOKEN) throw new Error("GitHub Packages authentication is required.");
if (manifest.publishConfig?.registry !== "https://npm.pkg.github.com") {
  throw new Error("Refusing to publish to an unexpected registry.");
}
const response = await fetch(`https://npm.pkg.github.com/${encodeURIComponent(manifest.name)}`, {
  headers: { Authorization: `Bearer ${process.env.NODE_AUTH_TOKEN}` },
});
if (response.ok) {
  const metadata = await response.json();
  if (metadata.versions?.[manifest.version]) {
    console.log(
      `${manifest.name}@${manifest.version} already exists; keeping the immutable version.`,
    );
    process.exit(0);
  }
} else if (response.status !== 404) {
  throw new Error(`GitHub Packages lookup failed (${response.status}); publication aborted.`);
}
execFileSync(
  "npm",
  [
    "publish",
    ".release-artifacts/github-mirror.tgz",
    "--registry=https://npm.pkg.github.com",
    "--ignore-scripts",
  ],
  {
    stdio: "inherit",
  },
);
