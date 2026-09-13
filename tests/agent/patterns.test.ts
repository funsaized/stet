// @vitest-environment node
import { expect, it } from "vitest";
import { transform } from "esbuild";
// @ts-expect-error Node-only template factory
import { lifecyclePattern } from "../../agent/patterns.mjs";
// @ts-expect-error Node-only template factory
import { snippet } from "../../agent/snippets.mjs";
it("rolls back partially attached groups and makes teardown idempotent", async () => {
  const code = lifecyclePattern("vanilla").code.replace(/^import .*;$/gm, "");
  const compiled = await transform(code, { loader: "ts", format: "esm" });
  const events: string[] = [];
  const attach = (name: string) => () => {
    events.push(name);
    return { destroy: () => events.push(`destroy ${name}`) };
  };
  const make = new Function(
    "circle",
    "sticky",
    "arrow",
    compiled.code.replace(/export\s*\{[\s\S]*?\};?/, "") + "\nreturn annotate;",
  );
  const annotate = make(attach("circle"), attach("sticky"), () => {
    throw Error("invalid destination");
  });
  const marks = annotate({});
  expect(() => marks.update(true, {})).toThrow("invalid destination");
  expect(events).toEqual(["circle", "sticky", "destroy sticky", "destroy circle"]);
  marks.destroy();
  marks.destroy();
  expect(events.length).toBe(4);
});

it("generates cancellation-aware motion sequencing for every framework", () => {
  for (const framework of ["vanilla", "react", "vue", "svelte", "angular"]) {
    const code = lifecyclePattern(framework).code;
    for (const token of [
      "visible: false",
      "animate: true",
      ".show()",
      ".hide()",
      ".replay()",
      '"cancelled"',
    ])
      expect(code, `${framework}: ${token}`).toContain(token);
  }
});

it("uses each adapter handle callback in generated snippets", () => {
  expect(snippet("box", "react").code).toContain("onHandle={onHandle}");
  expect(snippet("box", "vue").code).toContain("onHandle }");
  expect(snippet("box", "svelte").code).toContain("onHandle }");
  expect(snippet("box", "angular").code).toContain('[stetOnHandle]="onHandle"');
});
