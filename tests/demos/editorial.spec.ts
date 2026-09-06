import { expect, test } from "@playwright/test";

const demos = {
  vanilla: "http://127.0.0.1:4175/examples/vanilla/",
  vue: "http://127.0.0.1:4175/examples/vue/",
  react: "http://127.0.0.1:5175",
  svelte: "http://127.0.0.1:5176",
  angular: "http://127.0.0.1:4201",
};

for (const [name, url] of Object.entries(demos)) {
  for (const mobile of [false, true]) {
    test(`${name}: ${mobile ? "mobile" : "desktop"} editorial notes and live controls`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.emulateMedia({ colorScheme: name === "svelte" ? "dark" : "light", reducedMotion: mobile ? "reduce" : "no-preference" });
      if (mobile) await page.setViewportSize({ width: 390, height: 844 });
      let requests = 0;
      if (name === "react") {
        await page.route("https://api.github.com/repos/TanStack/query", route => {
          requests++;
          return route.fulfill({ json: {
            full_name: "TanStack/query", description: "Powerful asynchronous state management for the web.",
            html_url: "https://github.com/TanStack/query", stargazers_count: 50273, subscribers_count: 275, forks_count: 4231,
          } });
        });
      }
      await page.goto(url);
      await expect(page.locator(".stet-demo-banner")).toContainText(`stet-ified / ${name}`);
      const notes = page.locator(".stet-demo-note");
      await expect(notes).toHaveCount(2);
      await expect(page.locator(".stet-overlay--arrow")).toHaveCount(name === "vanilla" ? 3 : 2);
      await expect(page.locator(".stet-boil")).toHaveCount(mobile ? 0 : 9);
      for (const note of await notes.all()) {
        await note.scrollIntoViewIfNeeded();
        const box = (await note.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(mobile ? 390 : 1200);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(mobile ? 390 : 1200);
      if (name === "react") {
        if (mobile) {
          const hint = (await notes.first().boundingBox())!;
          const button = (await page.getByRole("button", { name: "Refetch", exact: true }).boundingBox())!;
          expect(hint.y + hint.height).toBeLessThan(button.y);
        }
        const before = requests;
        await page.getByRole("button", { name: "Refetch", exact: true }).click();
        await expect.poll(() => requests).toBeGreaterThan(before);
      } else if (name === "svelte") {
        await page.getByRole("button", { name: "Count is 0" }).click();
        await expect(page.getByRole("button", { name: "Count is 1" })).toBeVisible();
        const joy = notes.first();
        expect(await joy.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
      } else if (name === "vue") {
        await page.getByRole("button", { name: "Save 0", exact: true }).click();
        await expect(page.getByRole("button", { name: "Save 1", exact: true })).toBeVisible();
      } else if (name === "vanilla") {
        await page.getByRole("button", { name: "Publish", exact: true }).click();
        await expect(page.getByRole("status")).toContainText("Published");
      } else if (name === "angular") {
        await page.locator(".source-verdict").scrollIntoViewIfNeeded();
        await expect(page.locator(".stet-mark--right")).toBeVisible();
        const label = (await page.locator(".source-verdict").boundingBox())!;
        const check = (await page.locator(".stet-mark--right").boundingBox())!;
        expect(check.x).toBeGreaterThanOrEqual(label.x + label.width);
        expect(check.y + check.height).toBeGreaterThan(label.y);
      }
      expect(errors).toEqual([]);
    });
  }
}
