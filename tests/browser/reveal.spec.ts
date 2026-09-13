import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/vanilla/");
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.body.replaceChildren();
    document.body.style.cssText = "margin:0;min-height:3000px";
  });
});

type Primitive = "box" | "circle" | "underline";

async function attach(
  page: Page,
  options: Record<string, unknown>,
  top = 350,
  primitive: Primitive = "underline",
) {
  return page.evaluate(
    async ({ options, top, primitive }) => {
      const target = document.createElement("button");
      target.id = "target";
      target.style.cssText = `position:absolute;left:40px;top:${top}px;width:140px;height:40px`;
      document.body.append(target);
      const { box, circle, underline } = await import("/dist/index.js");
      (window as any).stet = { box, circle, underline }[primitive](target, {
        seed: 1,
        ...options,
      });
      const overlay = document.querySelector<HTMLElement>(`.stet-overlay--${primitive}`)!;
      const path = overlay.querySelector("path")!;
      return {
        hidden: overlay.hidden,
        offset: path.getAttribute("stroke-dashoffset"),
        pathLength: path.getAttribute("pathLength"),
        dasharray: path.getAttribute("stroke-dasharray"),
        opacity: path.getAttribute("opacity"),
      };
    },
    { options, top, primitive },
  );
}

const path = (page: Page, primitive: Primitive = "underline") =>
  page.locator(`.stet-overlay--${primitive} path`).first();

for (const primitive of ["box", "circle", "underline"] as const) {
  test(`${primitive} reveals with path-length dashes, no flash and no opacity`, async ({
    page,
  }) => {
    const initial = await attach(
      page,
      { animate: true, animationDelay: 200, animationDuration: 1500 },
      350,
      primitive,
    );
    // Frame zero is fully hidden but already normalized for path-length draw-on.
    expect(initial.hidden).toBe(false);
    expect(initial.offset).toBe("1");
    expect(initial.pathLength).toBe("1");
    expect(initial.dasharray).toBe("1");
    expect(initial.opacity).toBeNull();
    // A real browser interpolates the dash offset between 1 and 0.
    await expect
      .poll(async () => Number(await path(page, primitive).getAttribute("stroke-dashoffset")), {
        timeout: 3000,
      })
      .toBeLessThan(1);
    // The settled frame removes every reveal attribute and never touches opacity.
    await expect
      .poll(() => path(page, primitive).getAttribute("stroke-dashoffset"), { timeout: 4000 })
      .toBeNull();
    expect(await path(page, primitive).getAttribute("pathLength")).toBeNull();
    expect(await path(page, primitive).getAttribute("opacity")).toBeNull();
  });

  test(`${primitive} refresh, resketch, scroll and resize redraw without replay`, async ({
    page,
  }) => {
    await attach(page, { animate: true, animationDuration: 1500 }, 350, primitive);
    await page.waitForTimeout(500);
    const before = Number(await path(page, primitive).getAttribute("stroke-dashoffset"));
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(1);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      (window as any).stet.refresh();
      (window as any).stet.resketch(2);
    });
    const after = Number(await path(page, primitive).getAttribute("stroke-dashoffset"));
    // Restarting would jump the offset back toward 1; it can only advance.
    expect(after).toBeLessThanOrEqual(before + 0.02);
    await expect
      .poll(() => path(page, primitive).getAttribute("stroke-dashoffset"), { timeout: 4000 })
      .toBeNull();
  });

  test(`${primitive} initial visible:false stays settled and defers the reveal to show`, async ({
    page,
  }) => {
    const initial = await attach(
      page,
      { visible: false, animate: true, animationDelay: 200, animationDuration: 800 },
      350,
      primitive,
    );
    expect(initial.hidden).toBe(true);
    expect(initial.offset).toBeNull();
    await page.waitForTimeout(300);
    expect(await path(page, primitive).getAttribute("stroke-dashoffset")).toBeNull();
    const shown = await page.evaluate((name) => {
      (window as any).stet.show();
      const overlay = document.querySelector<HTMLElement>(`.stet-overlay--${name}`)!;
      return {
        hidden: overlay.hidden,
        offset: overlay.querySelector("path")!.getAttribute("stroke-dashoffset"),
      };
    }, primitive);
    expect(shown.hidden).toBe(false);
    expect(shown.offset).toBe("1");
    await expect
      .poll(() => path(page, primitive).getAttribute("stroke-dashoffset"), { timeout: 4000 })
      .toBeNull();
  });
}

test("a culled reveal completes and shows its final frame once unculled", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await attach(page, { animate: true, animationDuration: 400 }, 2000);
  const overlay = page.locator(".stet-overlay--underline");
  await expect.poll(() => overlay.evaluate((node) => (node as HTMLElement).hidden)).toBe(true);
  await page.waitForTimeout(800);
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
  await page.evaluate(() => {
    document.querySelector<HTMLElement>("#target")!.style.top = "100px";
    window.dispatchEvent(new Event("scroll"));
    (window as any).stet.refresh();
  });
  await expect.poll(() => overlay.evaluate((node) => (node as HTMLElement).hidden)).toBe(false);
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
});

test("a detached reveal completes and reconnects at its final frame", async ({ page }) => {
  await attach(page, { animate: true, animationDuration: 400 });
  const overlay = page.locator(".stet-overlay--underline");
  await page.evaluate(() => {
    (window as any).target = document.querySelector("#target")!;
    (window as any).target.remove();
    (window as any).stet.refresh();
  });
  await expect.poll(() => overlay.evaluate((node) => (node as HTMLElement).hidden)).toBe(true);
  await page.waitForTimeout(800);
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
  await page.evaluate(() => {
    document.body.prepend((window as any).target);
    (window as any).stet.refresh();
  });
  await expect.poll(() => overlay.evaluate((node) => (node as HTMLElement).hidden)).toBe(false);
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
});

for (const primitive of ["box", "circle", "underline"] as const) {
  test(`${primitive} settles immediately under initial reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const initial = await attach(page, { animate: true, animationDuration: 800 }, 350, primitive);
    expect(initial.hidden).toBe(false);
    expect(initial.offset).toBeNull();
    expect(initial.pathLength).toBeNull();
  });

  test(`static ${primitive} stays free of reveal attributes`, async ({ page }) => {
    const initial = await attach(page, {}, 350, primitive);
    expect(initial.offset).toBeNull();
    expect(initial.pathLength).toBeNull();
    expect(initial.dasharray).toBeNull();
    await page.evaluate(() => (window as any).stet.refresh());
    expect(await path(page, primitive).getAttribute("stroke-dashoffset")).toBeNull();
  });
}

// CORE-05: real-browser interruption cases. The unit matrix covers the state
// table; these prove the same ordering against a real compositor clock.
// CORE-06: ambient motion composition. These run against a real compositor
// clock so live media changes, hover resketch and boil cross-fades are observed,
// not simulated.
test("live reduced motion during the delay settles finished at the final frame", async ({
  page,
}) => {
  await attach(page, { animate: true, animationDelay: 5000, animationDuration: 2000 });
  await page.evaluate(() => {
    (window as any).revealStatus = (window as any).stet
      .show()
      .then((result: { status: string }) => result.status);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => path(page).getAttribute("stroke-dashoffset"), { timeout: 2000 })
    .toBeNull();
  expect(await path(page).getAttribute("pathLength")).toBeNull();
  await expect.poll(() => page.evaluate(() => (window as any).revealStatus)).toBe("finished");
});

test("live reduced motion during the reveal settles finished and drops boil", async ({ page }) => {
  await attach(page, { animate: true, animationDuration: 5000, boil: 0.4 });
  await expect(page.locator(".stet-boil")).toHaveCount(3);
  await page.waitForTimeout(300);
  expect(Number(await path(page).getAttribute("stroke-dashoffset"))).toBeLessThan(1);
  await page.evaluate(() => {
    (window as any).revealStatus = (window as any).stet
      .show()
      .then((result: { status: string }) => result.status);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".stet-boil")).toHaveCount(0);
  expect(await path(page).getAttribute("stroke-dashoffset")).toBeNull();
  await expect.poll(() => page.evaluate(() => (window as any).revealStatus)).toBe("finished");
});

test("hover resketch during reveal keeps the operation and never replays", async ({ page }) => {
  await attach(page, { animate: true, animationDuration: 4000, boil: 0.3, resketchOnHover: true });
  await page.evaluate(() => {
    (window as any).op = (window as any).stet.show();
  });
  await page.waitForTimeout(400);
  const before = Number(await path(page).getAttribute("stroke-dashoffset"));
  expect(before).toBeLessThan(1);
  const beforeD = await path(page).getAttribute("d");
  await page.locator("#target").hover();
  expect(Number(await path(page).getAttribute("stroke-dashoffset"))).toBeLessThanOrEqual(
    before + 0.01,
  );
  await expect.poll(() => path(page).getAttribute("d")).not.toBe(beforeD);
  expect(await page.evaluate(() => (window as any).stet.show() === (window as any).op)).toBe(true);
  await expect
    .poll(() => path(page).getAttribute("stroke-dashoffset"), { timeout: 6000 })
    .toBeNull();
  expect(await page.evaluate(() => (window as any).op)).toEqual({ status: "finished" });
});

test("boil variants share reveal progress with no initial or final flash", async ({ page }) => {
  const frameZero = await attach(page, { animate: true, animationDuration: 1500, boil: 0.4 });
  // Frame zero is sampled inside the attach task, before the first reveal tick.
  expect(frameZero.offset).toBe("1");
  expect(frameZero.pathLength).toBe("1");
  expect(frameZero.dasharray).toBe("1");
  expect(frameZero.opacity).toBeNull();
  const sample = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<SVGPathElement>(".stet-overlay--underline path")].map(
        (node) => ({
          offset: node.getAttribute("stroke-dashoffset"),
          pathLength: node.getAttribute("pathLength"),
          dasharray: node.getAttribute("stroke-dasharray"),
          opacity: node.getAttribute("opacity"),
        }),
      ),
    );
  const initial = await sample();
  expect(initial).toHaveLength(3);
  // All boil variants carry the same reveal progress; none is missing state.
  expect(new Set(initial.map((variant) => variant.offset)).size).toBe(1);
  for (const variant of initial) {
    expect(Number(variant.offset)).toBeLessThanOrEqual(1);
    expect(Number(variant.offset)).toBeGreaterThan(0.99);
    expect(variant.pathLength).toBe("1");
    expect(variant.dasharray).toBe("1");
    expect(variant.opacity).toBeNull();
  }
  await page.waitForTimeout(300);
  for (const variant of await sample()) {
    expect(Number(variant.offset)).toBeLessThanOrEqual(1);
    expect(Number(variant.offset)).toBeGreaterThanOrEqual(0);
    expect(variant.pathLength).toBe("1");
    expect(variant.opacity).toBeNull();
  }
  await expect
    .poll(async () => (await sample()).every((variant) => variant.offset === null), {
      timeout: 4000,
    })
    .toBe(true);
  for (const variant of await sample()) {
    expect(variant.offset).toBeNull();
    expect(variant.pathLength).toBeNull();
    expect(variant.opacity).toBeNull();
  }
});

test("fonts, theme, resize and scroll redraw at current progress without replay", async ({
  page,
}) => {
  await attach(page, { animate: true, animationDuration: 4000 });
  await page.waitForTimeout(400);
  const before = Number(await path(page).getAttribute("stroke-dashoffset"));
  expect(before).toBeLessThan(1);
  await page.evaluate(() => {
    document.fonts.dispatchEvent(new Event("loadingdone"));
    document.querySelector<HTMLElement>("#target")!.style.setProperty("--stet-stroke", "#123456");
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));
    (window as any).stet.refresh();
    (window as any).stet.resketch(2);
  });
  // Restarting would jump the offset back toward 1; it can only advance.
  expect(Number(await path(page).getAttribute("stroke-dashoffset"))).toBeLessThanOrEqual(
    before + 0.02,
  );
  await expect
    .poll(() => path(page).getAttribute("stroke-dashoffset"), { timeout: 6000 })
    .toBeNull();
});

test("a culled reveal finishes finished when reduced motion activates offscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await attach(page, { animate: true, animationDuration: 5000 }, 2000);
  const overlay = page.locator(".stet-overlay--underline");
  await expect.poll(() => overlay.evaluate((node) => (node as HTMLElement).hidden)).toBe(true);
  await page.evaluate(() => {
    (window as any).revealStatus = (window as any).stet
      .show()
      .then((result: { status: string }) => result.status);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.evaluate(() => (window as any).revealStatus)).toBe("finished");
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
});

test("reduced motion yields one stable variant for deterministic capture", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await attach(page, { animate: true, animationDuration: 4000, boil: 0.4 });
  const overlay = page.locator(".stet-overlay--underline");
  await expect(overlay.locator(".stet-boil")).toHaveCount(0);
  await expect(overlay.locator("path")).toHaveCount(1);
  expect(await overlay.locator("path").first().getAttribute("stroke-dashoffset")).toBeNull();
  const first = await overlay.screenshot();
  await page.waitForTimeout(250);
  const second = await overlay.screenshot();
  expect(second.equals(first)).toBe(true);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

for (const primitive of ["box", "circle", "underline"] as const) {
  test(`${primitive} show joins an in-flight reveal with the same promise object`, async ({
    page,
  }) => {
    await attach(
      page,
      { animate: true, animationDelay: 200, animationDuration: 1200 },
      350,
      primitive,
    );
    const result = await page.evaluate(async () => {
      const stet = (window as any).stet;
      const first = stet.show();
      const second = stet.show();
      return { same: first === second, status: (await first).status };
    });
    expect(result.same).toBe(true);
    expect(result.status).toBe("finished");
  });

  test(`${primitive} replay cancels the in-flight operation before the replacement settles`, async ({
    page,
  }) => {
    await attach(page, { animate: true, animationDuration: 1500 }, 350, primitive);
    const result = await page.evaluate(async () => {
      const stet = (window as any).stet;
      const order: string[] = [];
      const old = stet.show();
      old.then((value: { status: string }) => order.push(value.status));
      const next = stet.replay();
      next.then((value: { status: string }) => order.push(value.status));
      const joined = stet.show() === next;
      return { order, joined, old: await old, next: await next };
    });
    expect(result.joined).toBe(true);
    expect(result.old).toEqual({ status: "cancelled" });
    expect(result.next).toEqual({ status: "finished" });
    expect(result.order).toEqual(["cancelled", "finished"]);
  });

  test(`${primitive} hide cancels an in-flight operation exactly once and stays hidden`, async ({
    page,
  }) => {
    await attach(page, { animate: true, animationDuration: 1500 }, 350, primitive);
    const result = await page.evaluate(async (name) => {
      const stet = (window as any).stet;
      const op = stet.show();
      let settlements = 0;
      op.then(() => settlements++);
      stet.hide();
      stet.hide();
      const status = (await op).status;
      await new Promise((resolve) => setTimeout(resolve, 1700));
      const overlay = document.querySelector<HTMLElement>(`.stet-overlay--${name}`)!;
      return { status, settlements, hidden: overlay.hidden };
    }, primitive);
    expect(result.status).toBe("cancelled");
    expect(result.settlements).toBe(1);
    expect(result.hidden).toBe(true);
    expect(await path(page, primitive).getAttribute("stroke-dashoffset")).toBeNull();
  });

  test(`${primitive} destroy cancels an in-flight operation and no-ops afterwards`, async ({
    page,
  }) => {
    await attach(page, { animate: true, animationDuration: 1500 }, 350, primitive);
    const result = await page.evaluate(async (name) => {
      const stet = (window as any).stet;
      const op = stet.show();
      stet.destroy();
      const cancelled = (await op).status;
      const showPromise = stet.show();
      const replayPromise = stet.replay();
      const distinct = showPromise !== replayPromise;
      const show = await showPromise;
      const replay = await replayPromise;
      stet.hide();
      stet.refresh();
      stet.resketch(3);
      stet.destroy();
      return {
        cancelled,
        distinct,
        show,
        replay,
        overlay: document.querySelector(`.stet-overlay--${name}`),
      };
    }, primitive);
    expect(result.cancelled).toBe("cancelled");
    expect(result.distinct).toBe(true);
    expect(result.show).toEqual({ status: "cancelled" });
    expect(result.replay).toEqual({ status: "cancelled" });
    expect(result.overlay).toBeNull();
  });
}
