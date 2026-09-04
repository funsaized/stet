import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/prng.js";
import { roughArrow, roughEllipse, roughLine, variants } from "../src/rough.js";

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
});
