import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// PW-02 investigation only. Not wired into package scripts.
// - rebuild the package ESM dist the packed consumer imports
// - bundle the proposed IIFE payload into the gitignored dist/playwright/
// - pack, install offline into a fresh temp consumer, and record graph evidence
export default function globalSetup(): void {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  rmSync(`${root}test-results/pw02`, { recursive: true, force: true });
  execFileSync(process.execPath, [`${root}node_modules/typescript/bin/tsc`, "-p", `${root}tsconfig.json`], {
    cwd: root,
    stdio: "inherit",
  });
  execFileSync(process.execPath, [`${root}tests/pw02/build-payload.mjs`], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, [`${root}tests/pw02/prepare-consumer.mjs`], {
    cwd: root,
    stdio: "inherit",
  });
}
