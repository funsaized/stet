import { createApp, h, nextTick, reactive, withDirectives } from "vue";
import { expect, it } from "vitest";
import { vStetCircle } from "../src/vue.js";

it("tracks an edited reactive options object and destroys the directive", async () => {
  const options = reactive({ stroke: "red", seed: 7 });
  const root = document.createElement("div");
  document.body.append(root);
  const app = createApp({ render: () => withDirectives(h("button", "Save"), [[vStetCircle, options]]) });
  app.mount(root);
  const before = document.querySelector(".stet-overlay");
  options.stroke = "purple";
  await nextTick();
  const after = document.querySelector<HTMLElement>(".stet-overlay");
  expect(after).not.toBe(before);
  expect(after?.style.getPropertyValue("--stet-ink")).toBe("purple");
  app.unmount();
  expect(document.querySelector(".stet-overlay")).toBeNull();
  root.remove();
});
