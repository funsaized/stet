import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default function globalSetup(): void {
  execFileSync("npm", ["run", "build", "--silent"], {
    cwd: fileURLToPath(new URL("../../", import.meta.url)),
    stdio: "inherit",
  });
}
