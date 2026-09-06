import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import ts from "typescript";

// Optional git reference makes before/after measurements use exactly the same fixture.
const reference = process.argv[2];
const files = new Map();
const versions = reference ? ["before", "after"] : ["after"];
for (const version of versions) {
  for (const name of ["index", "mount", "primitives", "prng", "rough"]) {
    const source = version === "before"
      ? execFileSync("git", ["show", `${reference}:src/${name}.ts`], { encoding: "utf8" })
      : readFileSync(`src/${name}.ts`, "utf8");
    files.set(`/${version}/${name}.js`, ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 },
    }).outputText);
  }
  const css = version === "before"
    ? execFileSync("git", ["show", `${reference}:style.css`], { encoding: "utf8" })
    : readFileSync("style.css", "utf8");
  files.set(`/${version}/`, `<html><head><style>${css}</style></head><body></body></html>`);
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.route("http://stet.test/**", route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ body: files.get(path) ?? "", contentType: path.endsWith(".js") ? "text/javascript" : "text/html" });
  });
  const results = [];
  for (const version of versions) {
    await page.goto(`http://stet.test/${version}/`);
    results.push(...await page.evaluate(async version => {
      const { circle } = await import(`/${version}/index.js`);
      const rows = [];
      const median = values => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
      for (const count of [1, 10, 50, 100]) {
        const mounts = [], scrolls = [];
        let paths = 0, animations = 0;
        for (let round = 0; round < 5; round++) {
          const targets = Array.from({ length: count }, (_, i) => {
            const node = document.createElement("button");
            node.textContent = `Target ${i}`;
            node.style.cssText = `position:fixed;left:${(i % 10) * 110}px;top:${30 + Math.floor(i / 10) * 50}px;width:100px;height:32px`;
            document.body.append(node);
            return node;
          });
          void document.body.offsetHeight;
          const start = performance.now();
          const handles = targets.map((node, i) => circle(node, { seed: i }));
          mounts.push(performance.now() - start);
          await new Promise(requestAnimationFrame);
          await new Promise(requestAnimationFrame);
          paths = document.querySelectorAll(".stet-svg path").length;
          animations = document.getAnimations().length;
          const scrollStart = performance.now();
          for (let i = 0; i < 20; i++) window.dispatchEvent(new Event("scroll"));
          scrolls.push((performance.now() - scrollStart) / 20);
          handles.forEach(handle => handle.destroy());
          targets.forEach(node => node.remove());
          if (document.querySelector(".stet-overlay")) throw new Error("Overlay cleanup failed");
        }
        rows.push({ version, count, mountMs: +median(mounts).toFixed(2), scrollMs: +median(scrolls).toFixed(2), paths, animations });
      }
      return rows;
    }, version));
  }
  console.log(JSON.stringify({ browser: browser.version(), reference, rounds: 5, scrollEventsPerRound: 20, results }, null, 2));
} finally {
  await browser.close();
}
