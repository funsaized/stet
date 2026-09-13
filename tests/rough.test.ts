import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/prng.js";
import { arrowGeometry, markerWash, roughArrow, roughBox, roughCheckmark, roughEllipse, roughLine, variants } from "../src/rough.js";

const options = { seed: 123, roughness: 1, boil: 0.3 };

describe("rough geometry", () => {
  it("is deterministic for a fixed seed", () => {
    expect(roughLine(0, 0, 100, 20, options)).toBe(roughLine(0, 0, 100, 20, options));
    expect(roughEllipse(50, 20, 50, 20, options)).toBe(roughEllipse(50, 20, 50, 20, options));
    expect(roughArrow(0, 0, 100, 20, options)).toBe(roughArrow(0, 0, 100, 20, options));
    expect(roughBox(0, 0, 100, 60, options)).toBe(roughBox(0, 0, 100, 60, options));
  });

  it("varies boxes by seed and roughness", () => {
    const base = roughBox(0, 0, 80, 40, options);
    expect(roughBox(0, 0, 80, 40, { ...options, seed: 124 })).not.toBe(base);
    expect(roughBox(0, 0, 80, 40, { ...options, roughness: 3 })).not.toBe(base);
  });

  it("draws one open box path with a finishing overlap", () => {
    const path = roughBox(0, 0, 100, 60, options);
    expect(path.match(/M/g)).toHaveLength(1);
    expect(path).not.toContain("Z");
    // Four sides plus the retraced top edge.
    expect(path.match(/C/g)).toHaveLength(5);
    const numbers = (path.match(/-?\d+\.\d+/g) ?? []).map(Number);
    const [startX, startY] = numbers;
    const [endX, endY] = numbers.slice(-2);
    expect(endX).toBeGreaterThan(startX + 1);
    expect(Math.abs(endY - startY)).toBeLessThan(3);
  });

  it.each([0, 1, 42, 2147483647])("keeps zero and hairline boxes finite for seed %s", seed => {
    const o = { ...options, seed };
    for (const [w, h] of [[0, 0], [0, 20], [20, 0], [0.5, 0.5], [1, 400]] as const)
      expect(roughBox(10, 10, w, h, o)).not.toMatch(/NaN|Infinity/);
  });

  it("generates deterministic boil variants", () => {
    const first = variants((rough) => roughLine(0, 0, 20, 20, rough), options);
    expect(first).toEqual(variants((rough) => roughLine(0, 0, 20, 20, rough), options));
    expect(new Set(first).size).toBe(3);
  });

  it("provides a repeatable PRNG", () => {
    const a = mulberry32(9);
    const b = mulberry32(9);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("keeps a pen circle open at the finishing overlap", () => {
    const path = roughEllipse(50, 20, 50, 20, options);
    expect(path).not.toContain("Z");
    expect(path.match(/M/g)).toHaveLength(1);
  });

  it("shares arrow curve geometry with label placement", () => {
    expect(arrowGeometry(0, 0, 100, 0, 0).midpoint).toEqual([50, 0]);
    expect(arrowGeometry(0, 0, 100, 0, 0.2).midpoint).toEqual([50, 10]);
    expect(arrowGeometry(0, 0, 100, 0, -0.2).midpoint).toEqual([50, -10]);
  });

  it.each([0, 1, 42, 2147483647])("keeps compact and large strokes finite for seed %s", seed => {
    const o = { ...options, seed };
    for (const size of [0, 1, 24, 400, 1600]) {
      const paths = [roughEllipse(0, 0, size, size / 4, o), roughLine(0, 0, size, 0, o),
        roughArrow(0, 0, size, size, o), markerWash(0, 0, size, 20, o), roughCheckmark(0, 0, 25, 23, o),
        roughBox(0, 0, size, size / 2, o)];
      expect(paths.join("")).not.toMatch(/NaN|Infinity/);
    }
  });
});
