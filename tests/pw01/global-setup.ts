import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Narrow build prep for the investigation:
// - emit the package's own ESM dist that the source-authored fixture imports
// - bundle the test-only representative Playwright payload from src
export default function globalSetup(): void {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  execFileSync(process.execPath, [`${root}node_modules/typescript/bin/tsc`, "-p", `${root}tsconfig.json`], {
    cwd: root,
    stdio: "inherit",
  });
  execFileSync(process.execPath, [`${root}tests/pw01/build-payload.mjs`], { cwd: root, stdio: "inherit" });
}
