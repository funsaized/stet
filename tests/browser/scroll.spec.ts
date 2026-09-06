import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/vanilla/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.body.replaceChildren();
    document.body.style.cssText = "margin:0;min-height:3000px";
  });
});

for (const positionedBody of [false, true]) {
  test(`page marks scroll synchronously without SVG work (positioned body: ${positionedBody})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(async (positioned) => {
      if (positioned) document.body.style.cssText += ";position:relative;margin:25px;border:3px solid transparent";
      const target = document.createElement("button");
      target.id = "target";
      target.style.cssText = "position:absolute;left:40px;top:350px;width:100px;height:40px";
      document.body.append(target);
      const { circle } = await import("/dist/index.js");
      (window as any).sketch = circle(target, { seed: 1 });
    }, positionedBody);
    await expect(page.locator(".stet-overlay")).toBeVisible();
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    const result = await page.evaluate(() => {
      const target = document.querySelector("#target")!;
      const overlay = document.querySelector<HTMLElement>(".stet-overlay")!;
      const path = overlay.querySelector("path");
      const mutations = new MutationObserver(() => {});
      mutations.observe(overlay, { subtree: true, attributes: true, childList: true });
      window.scrollTo(0, 200);
      // Check before any scroll handler or animation frame can run.
      const targetBox = target.getBoundingClientRect();
      const overlayBox = overlay.getBoundingClientRect();
      const result = {
        position: getComputedStyle(overlay).position,
        x: overlayBox.left - targetBox.left,
        y: overlayBox.top - targetBox.top,
        mutations: mutations.takeRecords().length,
        samePath: path === overlay.querySelector("path"),
        scroll: scrollY,
      };
      mutations.disconnect();
      return result;
    });
    expect(result.scroll).toBe(200);
    expect(result.position).toBe("absolute");
    expect(result.x).toBeCloseTo(-5, 1);
    expect(result.y).toBeCloseTo(-5, 1);
    expect(result.mutations).toBe(0);
    expect(result.samePath).toBe(true);
  });
}

test("nested and sticky targets track scrolling and cancel pending work on destroy", async ({ page }) => {
  await page.evaluate(async () => {
    document.body.innerHTML = '<div id="scroller" style="height:200px;overflow:auto"><div style="height:100px"></div><button id="target">Target</button><div style="height:500px"></div></div><button id="sticky" style="position:sticky;top:10px;margin-top:100px">Sticky</button>';
    const { circle } = await import("/dist/index.js");
    (window as any).sketches = ["target", "sticky"].map(id => circle(document.getElementById(id)!, { seed: 1 }));
  });
  await page.locator("#scroller").evaluate(node => { node.scrollTop = 60; });
  await expect.poll(() => page.evaluate(() => {
    const target = document.querySelector("#target")!.getBoundingClientRect();
    const overlay = document.querySelector(".stet-overlay")!.getBoundingClientRect();
    return overlay.top - target.top;
  })).toBe(-5);
  await page.evaluate(() => window.scrollTo(0, 350));
  await expect.poll(() => page.evaluate(() => {
    const target = document.querySelector("#sticky")!.getBoundingClientRect();
    const overlay = document.querySelectorAll(".stet-overlay")[1].getBoundingClientRect();
    return overlay.top - target.top;
  })).toBe(-5);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("scroll"));
    (window as any).sketches.forEach((handle: any) => handle.destroy());
  });
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await expect(page.locator(".stet-overlay")).toHaveCount(0);
});

test("fixed targets coalesce a scroll burst without rebuilding SVGs", async ({ page }) => {
  await page.evaluate(async () => {
    document.body.innerHTML = '<button id="target" style="position:fixed;top:100px;left:50px">Fixed</button>';
    const { circle } = await import("/dist/index.js");
    (window as any).sketch = circle(document.querySelector("#target")!, { seed: 1 });
  });
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const result = await page.evaluate(async () => {
    const target = document.querySelector("#target")!;
    const measure = target.getBoundingClientRect.bind(target);
    let reads = 0;
    target.getBoundingClientRect = () => { reads++; return measure(); };
    const overlay = document.querySelector(".stet-overlay")!;
    const mutations = new MutationObserver(() => {});
    mutations.observe(overlay, { subtree: true, attributes: true, childList: true });
    for (let index = 0; index < 20; index++) window.dispatchEvent(new Event("scroll"));
    const synchronousReads = reads;
    await new Promise(requestAnimationFrame);
    const changes = mutations.takeRecords().length;
    mutations.disconnect();
    return { synchronousReads, reads, changes };
  });
  expect(result).toEqual({ synchronousReads: 0, reads: 1, changes: 0 });
});
