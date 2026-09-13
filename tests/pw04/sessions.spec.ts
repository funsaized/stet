import { expect, test, type Frame, type Locator } from "@playwright/test";
import { createStet, StetPlaywrightError } from "../../dist/playwright/entry.js";

const MAIN = "/tests/pw04/fixtures/main.html";

async function sameFrame(page: import("@playwright/test").Page): Promise<Frame> {
  const frame = page.frames().find((candidate) => candidate.url().includes("/frame.html") && candidate.url().includes("127.0.0.1"));
  expect(frame).toBeTruthy();
  return frame!;
}

async function expectCode(promise: Promise<unknown>, code: string, role?: string) {
  await expect(promise).rejects.toMatchObject({ name: "StetPlaywrightError", code, ...(role ? { role } : {}) });
}

for (const target of ["page", "frame"] as const) {
  test(`${target}: all public primitive methods attach to the bound document`, async ({ page }) => {
    await page.goto(MAIN);
    await page.waitForFunction(() => Boolean((globalThis as Record<string, unknown>).__authored));
    const context = target === "page" ? page : await sameFrame(page);
    const session = await createStet(context);
    const one = context.locator("#one");
    const two = context.locator("#two");
    const handles = [
      await session.circle(one),
      await session.underline(one),
      await session.highlight(one),
      await session.arrow(one, two),
      await session.sticky(one, { text: "note" }),
      await session.mark(one, "right"),
    ];
    expect(handles).toHaveLength(6);
    await expect(context.locator(".stet-overlay")).toHaveCount(target === "page" ? 7 : 6);
    await session.dispose();
    await expect(context.locator(".stet-overlay")).toHaveCount(target === "page" ? 1 : 0);
    await expect(page.locator(".stet-overlay")).toHaveCount(1);
  });
}

test("exact-one snapshot distinguishes missing, ambiguous, detached, and wrong document", async ({ page }) => {
  await page.goto(MAIN);
  const session = await createStet(page);
  await expectCode(session.circle(page.locator("#missing")), "TARGET_MISSING", "target");
  await expectCode(session.circle(page.locator(".many")), "TARGET_AMBIGUOUS", "target");
  const frame = await sameFrame(page);
  await expectCode(session.circle(frame.locator("#one")), "WRONG_DOCUMENT", "target");

  const locator = page.locator("#one");
  const original = locator.elementHandles.bind(locator);
  const racing = Object.create(locator) as Locator;
  racing.elementHandles = async () => {
    const handles = await original();
    await page.locator("#one").evaluate((element) => element.replaceWith(element.cloneNode(true)));
    return handles;
  };
  await expectCode(session.circle(racing), "TARGET_DETACHED", "target");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  await session.dispose();
});

test("arrows resolve from then to and reject cross-document endpoints without attaching", async ({ page }) => {
  await page.goto(MAIN);
  const session = await createStet(page);
  await expectCode(session.arrow(page.locator("#missing"), page.locator("#two")), "TARGET_MISSING", "from");
  await expectCode(session.arrow(page.locator("#one"), (await sameFrame(page)).locator("#two")), "WRONG_DOCUMENT", "to");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  await session.dispose();
});

test("same-origin frames work; cross-origin and detached frames are rejected without mutation", async ({ page }) => {
  await page.goto(MAIN);
  const same = await sameFrame(page);
  const session = await createStet(same);
  await session.circle(same.locator("#one"));
  await session.dispose();

  const blank = await page.evaluate(() => {
    const iframe = document.createElement("iframe");
    iframe.id = "blank";
    document.body.append(iframe);
    iframe.contentDocument!.body.innerHTML = '<button id="blank-target">blank</button>';
    return true;
  });
  expect(blank).toBe(true);
  const blankFrame = page.frames().find((frame) => frame.url() === "about:blank");
  expect(blankFrame).toBeTruthy();
  const blankSession = await createStet(blankFrame!);
  await blankSession.circle(blankFrame!.locator("#blank-target"));
  await blankSession.dispose();

  const cross = page.frames().find((frame) => frame.url().includes("localhost:4184"));
  expect(cross).toBeTruthy();
  await expectCode(createStet(cross!), "UNSUPPORTED_CONTEXT");
  const detached = await sameFrame(page);
  await page.locator("#same").evaluate((element) => element.remove());
  await expectCode(createStet(detached), "UNSUPPORTED_CONTEXT");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
});

test("session cleanup leaves another session, source-authored Stet, and foreign content", async ({ page }) => {
  await page.goto(MAIN);
  await page.waitForFunction(() => Boolean((globalThis as Record<string, unknown>).__authored));
  const before = await page.locator("#foreign").evaluate((element) => getComputedStyle(element).outline);
  const a = await createStet(page);
  const b = await createStet(page);
  await a.circle(page.locator("#one"));
  await b.circle(page.locator("#two"));
  await expect(page.locator(".stet-overlay")).toHaveCount(3);
  await a.dispose();
  await expect(page.locator(".stet-overlay")).toHaveCount(2);
  await b.dispose();
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  expect(await page.locator("#foreign").evaluate((element) => getComputedStyle(element).outline)).toBe(before);
});

test("failed runtime attachment rolls back without adopting a handle", async ({ page }) => {
  await page.goto(MAIN);
  const session = await createStet(page);
  await expectCode(session.circle(page.locator("#one"), { animationDuration: -1 }), "INVALID_OPTIONS");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  await session.dispose();
});

test("unsupported objects are rejected without page mutation", async ({ page }) => {
  await page.goto(MAIN);
  await expectCode(createStet(page.locator("#one") as never), "UNSUPPORTED_CONTEXT");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  expect(StetPlaywrightError).toBeDefined();
});
