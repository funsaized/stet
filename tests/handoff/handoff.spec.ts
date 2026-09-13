import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const env: { entryUrl: string } = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../test-results/pw08/env.json", import.meta.url)), "utf8"),
);
const installed: { name: string; version: string; exports: Record<string, unknown> } = JSON.parse(
  readFileSync(
    fileURLToPath(
      new URL("../../test-results/pw08/consumer/node_modules/@funsaized/stet/package.json", import.meta.url),
    ),
    "utf8",
  ),
);

async function annotate(page: Page) {
  const { createStet } = await import(env.entryUrl);
  const before = await page.locator("#password").boundingBox();
  const session = await createStet(page);
  const note = await session.underline(page.getByRole("button", { name: "Save changes" }), {
    seed: 8,
    description: "Save action under review",
  });
  return { session, note, before };
}

async function verifyNativeBehavior(
  page: Page,
  before: { x: number; y: number; width: number; height: number } | null,
) {
  // Control identity and layout are asserted separately from annotation presence.
  expect(await page.evaluate(() => {
    const nodes = (globalThis as Record<string, unknown>).__handoffNodes as {
      password: Element;
      save: Element;
    };
    return (
      nodes.password === document.querySelector("#password") &&
      nodes.save === document.querySelector("#save")
    );
  })).toBe(true);
  expect(await page.locator("#password").boundingBox()).toEqual(before);

  await page.locator("#password").fill("correct-horse-battery");
  await expect(page.locator("#password")).toBeFocused();
  await expect(page.locator("#password")).toHaveValue("correct-horse-battery");
  await expect(page.locator("#save")).toHaveAccessibleDescription(/Save action under review/);
  expect(
    await page.locator(".stet-overlay").first().evaluate((element) => getComputedStyle(element).pointerEvents),
  ).toBe("none");
  await page.locator("#save").click();
  await expect(page.locator("#status")).toHaveText(/^Saved \d+ characters$/);
}

test("handoff shows durable source and temporary injected variants with independent checks", async ({ page }) => {
  await page.goto("/examples/handoff/");
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.sourceState === "ready" &&
      document.documentElement.dataset.handlers === "ready",
  );
  await page.evaluate(() => document.fonts.ready);

  // Package/version context and application route/state.
  expect(installed.name).toBe("@funsaized/stet");
  expect(installed.version).toBe("0.1.0");
  expect(installed.exports["./playwright"]).toBeTruthy();
  await expect(page.locator("#handoff")).toHaveAttribute("data-route", "/examples/handoff/");
  await expect(page.locator("#handoff")).toHaveAttribute("data-app-state", "ready");
  expect(new URL(page.url()).pathname).toBe("/examples/handoff/");

  // Durable source variant exists before any injection.
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  await expect(page.locator(".stet-overlay--circle path").first()).toHaveCSS("stroke", "rgb(201, 42, 42)");
  await expect(page.locator(".stet-overlay--circle")).toHaveCSS("pointer-events", "none");
  await expect(page.locator("#password")).toHaveAccessibleDescription(
    /At least 12 characters.*New minimum: 12 characters/,
  );
  const source = await page.locator("#handoff").screenshot({
    path: "test-results/handoff/source.png",
    animations: "disabled",
  });
  expect((await page.locator("#handoff").screenshot({ animations: "disabled" })).equals(source)).toBe(true);

  // Temporary injected variant.
  const { session, note, before } = await annotate(page);
  try {
    await expect(note.show()).resolves.toEqual({ status: "finished" });
    await note.refresh();
    await expect(page.locator(".stet-overlay")).toHaveCount(2);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);

    const injected = await page.locator("#handoff").screenshot({
      path: "test-results/handoff/injected.png",
      animations: "disabled",
    });
    expect((await page.locator("#handoff").screenshot({ animations: "disabled" })).equals(injected)).toBe(true);

    await verifyNativeBehavior(page, before);
  } finally {
    await session.dispose();
  }

  // Injection removes only what it owns; the durable source mark and its
  // accessible description remain.
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
  await expect(page.locator("#password")).toHaveAccessibleDescription(/New minimum: 12 characters/);
  await expect(page.locator("#save")).not.toHaveAccessibleDescription(/Save action under review/);
  await expect(page.locator("#password")).toHaveAttribute(
    "aria-describedby",
    /^password-help stet-description-/,
  );
});

test("the checks detect a broken submit while annotated, and cleanup still runs", async ({ page }) => {
  await page.goto("/examples/handoff/?broken=1");
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.sourceState === "ready" &&
      document.documentElement.dataset.handlers === "ready",
  );

  const { session } = await annotate(page);
  let detected: unknown;
  try {
    await page.locator("#password").fill("correct-horse-battery");
    await page.locator("#save").click();
    await expect(page.locator("#status")).toHaveText(/^Saved \d+ characters$/);
  } catch (error) {
    detected = error;
  } finally {
    await session.dispose();
  }
  expect(detected).toBeInstanceOf(Error);
  await expect(page.locator("#status")).toHaveText("Broken fixture did not submit");
  await expect(page.locator(".stet-overlay")).toHaveCount(1);
});
