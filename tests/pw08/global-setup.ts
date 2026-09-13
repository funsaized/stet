import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default function globalSetup(): void {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  execFileSync("npm", ["run", "build", "--silent"], { cwd: root, stdio: "inherit" });
  execFileSync(process.execPath, [`${root}tests/pw08/prepare-consumer.mjs`], {
    cwd: root,
    stdio: "inherit",
  });
}
