import validateSchema from './validate.generated.mjs';
import { primitives } from './catalog.mjs';
const jsonPath = pointer => pointer.split('/').slice(1).map(s => s.replace(/~1/g, '/').replace(/~0/g, '~')).map(s => /^\d+$/.test(s) ? `[${s}]` : /^[A-Za-z_$][\w$]*$/.test(s) ? `.${s}` : `[${JSON.stringify(s)}]`).join('').replace(/^\./, '');
export function validatePlan(plan) {
  const errors = [], warnings = [];
  const schemaValid = validateSchema(plan);
  for (const error of validateSchema.errors ?? []) {
    if (['oneOf', 'if'].includes(error.keyword)) continue;
    if (error.keyword === 'required' && error.params.missingProperty === 'rationale') continue;
    const branch = error.schemaPath.match(/\/oneOf\/(\d+)\//);
    const annotation = error.instancePath.match(/^\/annotations\/(\d+)/);
    if (branch && annotation) {
      const primitive = plan?.annotations?.[Number(annotation[1])]?.primitive;
      if ((typeof primitive === 'string' && Object.hasOwn(primitives, primitive)) && Object.keys(primitives)[Number(branch[1])] !== primitive) continue;
      if (!(typeof primitive === 'string' && Object.hasOwn(primitives, primitive))) {
        const path = `annotations[${annotation[1]}].primitive`;
        if (!errors.some(e => e.path === path)) errors.push({ path, code: 'UNKNOWN_PRIMITIVE', message: `Choose a primitive from: ${Object.keys(primitives).join(', ')}.` });
        continue;
      }
    }
    const property = error.params.additionalProperty ?? error.params.missingProperty;
    const pointer = error.instancePath + (property === undefined ? '' : '/' + property.replace(/~/g, '~0').replace(/\//g, '~1'));
    const path = jsonPath(pointer) || '$';
    const code = error.keyword === 'additionalProperties' ? 'UNKNOWN_PROPERTY' : error.keyword === 'required' ? 'REQUIRED' : ['minItems', 'maxItems'].includes(error.keyword) && error.instancePath.endsWith('/targets') ? 'TARGET_COUNT' : 'INVALID_VALUE';
    const primitive = annotation && plan?.annotations?.[Number(annotation[1])]?.primitive;
    const context = typeof primitive === 'string' && Object.hasOwn(primitives, primitive) ? `${primitive}: ` : '';
    const message = error.keyword === 'required' ? `Add required field ${property}.`
      : error.keyword === 'type' ? `Expected ${error.params.type}${error.params.type === 'number' ? ' (finite)' : ''}.`
      : error.keyword === 'pattern' ? 'Use nonblank text (IDs must start with a letter or digit and contain only letters, digits, dots, underscores or hyphens).'
      : path === 'version' ? 'This installation supports plan version 1. Use a compatible installed Stet version or author a version 1 plan.'
      : null;
    const item = { path, code: (/\/options(?:\/|$)/.test(pointer)) ? 'INVALID_OPTION' : code, message: context + (message ?? (property && error.keyword === 'additionalProperties' ? `Property ${property} is not accepted here. Inspect the installed schema.` : `${error.message}${error.params.allowedValues ? ': ' + error.params.allowedValues.join(', ') : ''}${error.params.allowedValue !== undefined ? ': ' + error.params.allowedValue : ''}.`)) };
    if (!errors.some(e => e.path === path && e.message === item.message)) errors.push(item);
  }
  if (Array.isArray(plan?.annotations)) {
    const ids = new Set();
    plan.annotations.forEach((annotation, i) => {
      if (!annotation || typeof annotation !== 'object') return;
      if (typeof annotation.id === 'string') {
        if (ids.has(annotation.id)) errors.push({ path: `annotations[${i}].id`, code: 'DUPLICATE_ID', message: 'Annotation IDs must be unique within a plan.' });
        ids.add(annotation.id);
      }
      if (Array.isArray(annotation.targets)) annotation.targets.forEach((target, j) => {
        if (target?.strategy === 'css' && !(typeof target.rationale === 'string' && target.rationale.trim())) errors.push({ path: `annotations[${i}].targets[${j}].rationale`, code: 'TARGET_RATIONALE_REQUIRED', message: 'Explain why a stable ref, id, data attribute or source target cannot be used.' });
        if (target?.strategy === 'css') warnings.push({ path: `annotations[${i}].targets[${j}]`, code: 'BRITTLE_TARGET', message: 'Verify uniqueness and stability in the source and browser; CSS is a last resort.' });
      });
      const options = annotation.options;
      if ((typeof annotation.primitive === 'string' && Object.hasOwn(primitives, annotation.primitive)) && !options?.description && !options?.label && !options?.text) warnings.push({ path: `annotations[${i}].options`, code: 'DECORATIVE_ONLY', message: 'If this annotation carries meaning, supply description, sticky text or an arrow label.' });
    });
  }
  if (!schemaValid && !errors.length) errors.push({ path: '$', code: 'INVALID_VALUE', message: 'Plan does not match the installed annotation-plan schema. Inspect the installed schema and correct the plan.' });
  return { ok: errors.length === 0, errors, warnings };
}
