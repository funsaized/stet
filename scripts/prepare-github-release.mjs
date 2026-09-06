import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// Mirror the already-published artifact, rather than rebuilding the same version.
const tag = process.env.RELEASE_TAG ?? process.argv[2];
const manifest = JSON.parse(await readFile("package.json", "utf8"));
if (!/^v\d+\.\d+\.\d+(?:-[\da-zA-Z.-]+)?$/.test(tag ?? "") || tag !== `v${manifest.version}`) {
  throw new Error("Release tag must match the package.json version (for example v0.0.1).");
}
if (manifest.name !== "@funsaized/stet") throw new Error("Unexpected package name.");

const metadataResponse = await fetch(
  `https://registry.npmjs.org/${encodeURIComponent(manifest.name)}/${manifest.version}`,
);
if (!metadataResponse.ok)
  throw new Error(
    `Publish ${manifest.name}@${manifest.version} to npm first (${metadataResponse.status}).`,
  );
const metadata = await metadataResponse.json();
const source = new URL(metadata.dist.tarball);
if (source.protocol !== "https:" || source.hostname !== "registry.npmjs.org")
  throw new Error("Unexpected artifact host.");
const response = await fetch(source);
if (!response.ok) throw new Error(`Artifact download failed (${response.status}).`);
const archive = Buffer.from(await response.arrayBuffer());
const integrity = `sha512-${createHash("sha512").update(archive).digest("base64")}`;
if (integrity !== metadata.dist.integrity)
  throw new Error("Published artifact integrity check failed.");

const directory = resolve(".release-artifacts");
await mkdir(directory); // Fail on stale staging data rather than mixing two releases.
const filename = `funsaized-stet-${manifest.version}.tgz`;
await writeFile(resolve(directory, filename), archive);
await writeFile(
  resolve(directory, "SHA256SUMS"),
  `${createHash("sha256").update(archive).digest("hex")}  ${filename}\n`,
);
execFileSync("tar", ["-xzf", resolve(directory, filename), "-C", directory]);
const packagePath = resolve(directory, "package/package.json");
const published = JSON.parse(await readFile(packagePath, "utf8"));
if (
  published.name !== manifest.name ||
  published.version !== manifest.version ||
  published.repository?.url !== "git+https://github.com/funsaized/stet.git"
) {
  throw new Error("Published package identity or repository does not match.");
}
// The original archive above remains untouched for the release download.
published.publishConfig = { ...published.publishConfig, registry: "https://npm.pkg.github.com" };
await writeFile(packagePath, `${JSON.stringify(published, null, 2)}\n`);
console.log(
  `Verified ${manifest.name}@${manifest.version}; staged GitHub Packages mirror and release assets.`,
);
