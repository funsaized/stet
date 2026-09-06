// @vitest-environment node
import { expect, it } from 'vitest';
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
// @ts-expect-error Agent tooling is intentionally outside the browser TS build.
import { validatePlan } from '../../agent/validate.mjs';
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const schema = read('agent/schemas/annotation-plan.schema.json');
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
const fixtures = read('agent/evals/plans.json');
for (const fixture of fixtures) it(`plan fixture: ${fixture.name}`, () => {
  const result = validatePlan(fixture.plan);
  expect(result.ok).toBe(fixture.valid);
  expect(validate(fixture.plan)).toBe(fixture.schemaValid ?? fixture.valid);
  if (fixture.path) expect(result.errors.some((e: {path: string}) => e.path === fixture.path)).toBe(true);
});
it('capabilities match their published schema and expose package exports', () => {
  const caps = read('agent/capabilities.json');
  expect(ajv.compile(read('agent/schemas/capabilities.schema.json'))(caps)).toBe(true);
  const pkg = read('package.json'); expect(caps.package).toEqual({ name: pkg.name, version: pkg.version, exports: Object.keys(pkg.exports) });
  expect(pkg.dependencies).toBeUndefined();
});
it('accepts every primitive/framework and rejects each incompatible option', () => {
  const caps = read('agent/capabilities.json');
  const target = { strategy: 'id', file: 'index.html', locator: 'save', description: 'Save' };
  for (const framework of Object.keys(caps.frameworks)) for (const [primitive, meta] of Object.entries<any>(caps.primitives)) {
    const annotation = { id: primitive, primitive, targets: meta.targets.map(() => target), options: primitive === 'sticky' ? { text: 'Save first.' } : {}, ...(primitive === 'mark' ? { kind: 'right' } : {}) };
    const plan = { version: 1, framework, intent: 'explain', annotations: [annotation] };
    expect(validatePlan(plan).ok).toBe(true);
    for (const [key,value] of Object.entries({ side: 'right', text: 'note', label: 'label', curvature: 0.1, imaginary: true })) {
      if (key in meta.options.properties) continue;
      expect(validatePlan({ ...plan, annotations: [{ ...annotation, options: { ...annotation.options, [key]: value } }] }).ok).toBe(false);
    }
  }
});
it('reports decorative and brittle targeting warnings without executing locators', () => {
  const plan = fixtures[0].plan;
  const a = { ...plan.annotations[0], options: {}, targets: [{ ...plan.annotations[0].targets[0], strategy: 'css', locator: 'button:nth-child(3)', rationale: 'Legacy page without stable attributes; verified unique.' }] };
  const result = validatePlan({ ...plan, annotations: [a] });
  expect(result.ok).toBe(true); expect(result.warnings.map((w: {code: string}) => w.code)).toEqual(['BRITTLE_TARGET', 'DECORATIVE_ONLY']);
});

it('returns diagnostics for malformed JSON-shaped primitive values', () => {
  for (const primitive of [null, 4, [], {}, { toString: null }]) {
    const plan = structuredClone(fixtures[0].plan); plan.annotations[0].primitive = primitive;
    expect(validatePlan(plan).ok).toBe(false);
  }
});
