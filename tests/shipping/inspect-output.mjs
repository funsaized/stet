import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const work = fileURLToPath(new URL("../../test-results/shipping/", import.meta.url));
const builds = join(work, "consumer/builds");
const reviewNeedles = [
  "STET_REVIEW_MODULE_SENTINEL",
  "STET_REVIEW_COPY_SENTINEL",
  "STET_REVIEW_PLAN_SENTINEL",
  "STET_REVIEW_CSS_SENTINEL",
];
const runtimeNeedles = ["stet-overlay", "stet-description-", "--stet-stroke"];
const isReviewPath = (value) =>
  /[/\\]stet[/\\]review(?:\.|-)/.test(value) &&
  !/[/\\]stet[/\\]review-boundary(?:\.ts)?$/.test(value);
const strings = (value) =>
  typeof value === "string"
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === "object"
        ? Object.entries(value).flatMap(([key, entry]) => [key, ...strings(entry)])
        : [];

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function inspect(name, { review, production, runtime, publishedMaps }) {
  const dir = join(builds, name);
  const inventory = files(dir).map((path) => ({ path, content: readFileSync(path, "utf8") }));
  const assertNeedles = (needles, expected, claim) => {
    for (const needle of needles) {
      const match = inventory.find(({ content }) => content.includes(needle));
      if (Boolean(match) !== expected)
        throw new Error(
          `${name}: ${claim} ${expected ? "missing" : "leaked"} ${needle}${match ? ` in ${relative(dir, match.path)}` : ""}`,
        );
    }
  };
  assertNeedles(reviewNeedles, review, "review content");
  assertNeedles(["STET_PRODUCTION_SENTINEL"], production, "production content");
  assertNeedles(runtimeNeedles, runtime, "Stet runtime");
  const manifest = inventory.find(({ path }) => path.endsWith("/.vite/manifest.json"));
  if (!manifest) throw new Error(`${name}: missing Vite manifest`);
  if (!review && strings(JSON.parse(manifest.content)).some(isReviewPath))
    throw new Error(`${name}: manifest retained a review module or chunk`);
  const mapFiles = inventory.filter(({ path }) => path.endsWith(".map"));
  if (mapFiles.length === 0)
    throw new Error(
      `${name}: ${publishedMaps ? "published" : "hidden"} source maps were not discovered by listing output`,
    );
  const mapLinkPublished = inventory
    .filter(({ path }) => path.endsWith(".js"))
    .some(({ content }) => content.includes("sourceMappingURL="));
  if (mapLinkPublished !== publishedMaps)
    throw new Error(`${name}: expected ${publishedMaps ? "published" : "hidden"} source-map links`);
  for (const { path, content } of mapFiles) {
    const map = JSON.parse(content);
    const decoded = JSON.stringify({
      sources: map.sources,
      sourcesContent: map.sourcesContent,
      names: map.names,
    });
    if (
      !review &&
      (map.sources.some(isReviewPath) || reviewNeedles.some((needle) => decoded.includes(needle)))
    )
      throw new Error(`${name}: review source leaked in ${relative(dir, path)}`);
  }
  return { name, files: inventory.map(({ path }) => relative(dir, path)) };
}

export function scanShippingOutput() {
  return [
    inspect("production", { review: false, production: true, runtime: true, publishedMaps: false }),
    inspect("preview-preview", {
      review: true,
      production: false,
      runtime: true,
      publishedMaps: false,
    }),
    inspect("preview-customer", {
      review: false,
      production: false,
      runtime: false,
      publishedMaps: false,
    }),
    inspect("preview-customer-map", {
      review: false,
      production: false,
      runtime: false,
      publishedMaps: true,
    }),
    inspect("local-build", {
      review: false,
      production: false,
      runtime: false,
      publishedMaps: false,
    }),
    inspect("local-build-map", {
      review: false,
      production: false,
      runtime: false,
      publishedMaps: true,
    }),
    inspect("mixed-customer", {
      review: false,
      production: true,
      runtime: true,
      publishedMaps: false,
    }),
    inspect("mixed-customer-map", {
      review: false,
      production: true,
      runtime: true,
      publishedMaps: true,
    }),
    inspect("mixed-preview", {
      review: true,
      production: true,
      runtime: true,
      publishedMaps: false,
    }),
  ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const inventory = scanShippingOutput();
  const broken = join(builds, "deliberately-broken");
  rmSync(broken, { recursive: true, force: true });
  mkdirSync(broken, { recursive: true });
  cpSync(join(builds, "preview-customer"), broken, { recursive: true });
  writeFileSync(join(broken, "leak.txt"), reviewNeedles[1]);
  let detected = "";
  try {
    inspect("deliberately-broken", {
      review: false,
      production: false,
      runtime: false,
      publishedMaps: false,
    });
  } catch (error) {
    detected = String(error);
  }
  if (!detected.includes("leak.txt") || !detected.includes(reviewNeedles[1]))
    throw new Error(`Deliberate leak was not identified: ${detected}`);
  console.log(JSON.stringify({ ok: true, inventory, deliberateFailure: detected }, null, 2));
}
