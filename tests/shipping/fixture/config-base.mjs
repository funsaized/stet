import { fileURLToPath } from "node:url";

export function makeConfig(policy, app) {
  if (!new Set(["off", "preview", "local"]).has(policy))
    throw new Error(`Unknown Stet review policy: ${policy}`);
  return ({ command, mode }) => ({
    root: fileURLToPath(new URL(`apps/${app}/`, import.meta.url)),
    base: "./",
    define: {
      __STET_REVIEW_BUILD__: JSON.stringify(
        policy === "preview"
          ? mode === "stet-preview"
          : policy === "local"
            ? command === "serve"
            : false,
      ),
    },
    build: { manifest: true, sourcemap: "hidden" },
  });
}
