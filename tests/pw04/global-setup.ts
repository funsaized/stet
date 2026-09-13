import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default function globalSetup(): void {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  execFileSync("npm", ["run", "build", "--silent"], { cwd: root, stdio: "inherit" });
}
