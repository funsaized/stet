import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { allPlans } from '../../website/src/showcase/scenarios';
import { validatePlan } from '../../agent/validate.mjs';

it('validates every showcase plan and resolves its source refs', () => {
  for (const plan of allPlans) {
    expect(validatePlan(plan), plan.intent).toMatchObject({ ok: true, errors: [], warnings: [] });
    for (const annotation of plan.annotations) for (const target of annotation.targets) {
      const source = readFileSync(target.file, 'utf8');
      expect(source).toContain(`ref={${target.locator}}`);
      expect(source).toContain(`target={${target.locator}}`);
    }
  }
});

it('accepts placement recovery only on its intended primitives', () => {
  const base = allPlans[0];
  const target = base.annotations[0].targets[0];
  const check = (annotation: unknown) => validatePlan({ ...base, annotations: [annotation] }).ok;
  const sticky = { id: 'note', primitive: 'sticky', targets: [target], options: { text: 'Follow up', offsetX: 24, offsetY: -18 } };
  const arrow = { id: 'connection', primitive: 'arrow', targets: [target, { ...target, locator: 'warning' }], options: { label: 'Changed', labelOffsetX: -12, labelOffsetY: 20 } };
  expect(check(sticky)).toBe(true); expect(check(arrow)).toBe(true);
  expect(check({ ...sticky, options: { ...sticky.options, offsetX: Infinity } })).toBe(false);
  expect(check({ ...arrow, options: { ...arrow.options, labelOffsetY: '20px' } })).toBe(false);
  expect(check({ ...base.annotations[0], options: { offsetX: 12 } })).toBe(false);
});
