import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/prng.js";
import { arrowGeometry, markerWash, roughArrow, roughCheckmark, roughEllipse, roughLine, variants } from "../src/rough.js";

const options = { seed: 123, roughness: 1, boil: 0.3 };

describe("rough geometry", () => {
  it("is deterministic for a fixed seed", () => {
    expect(roughLine(0, 0, 100, 20, options)).toBe(roughLine(0, 0, 100, 20, options));
    expect(roughEllipse(50, 20, 50, 20, options)).toBe(roughEllipse(50, 20, 50, 20, options));
    expect(roughArrow(0, 0, 100, 20, options)).toBe(roughArrow(0, 0, 100, 20, options));
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
        roughArrow(0, 0, size, size, o), markerWash(0, 0, size, 20, o), roughCheckmark(0, 0, 25, 23, o)];
      expect(paths.join("")).not.toMatch(/NaN|Infinity/);
    }
  });
});
