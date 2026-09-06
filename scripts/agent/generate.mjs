import ts from 'typescript';
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone/index.js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { frameworks, primitives, defaults, strategies, tools, constraints } from '../../agent/catalog.mjs';
import { snippet } from '../../agent/snippets.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json')));
const program = ts.createProgram(['src/index.ts', 'src/mount.ts', 'src/primitives.ts', 'src/react.ts', 'src/vue.ts', 'src/svelte.ts', 'src/angular.ts'].map(p => resolve(root, p)), { strict: true, target: ts.ScriptTarget.ES2020 });
const checker = program.getTypeChecker();
const declarations = new Map();
for (const file of program.getSourceFiles()) {
  if (!file.fileName.startsWith(resolve(root, 'src'))) continue;
  ts.forEachChild(file, node => {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) declarations.set(node.name.text, node);
  });
}
function schemaType(type) {
  if (type.isUnion()) {
    const members = type.types.filter(t => !(t.flags & ts.TypeFlags.Undefined));
    if (members.every(t => t.isStringLiteral())) return { type: 'string', enum: members.map(t => t.value) };
    if (members.every(t => t.flags & ts.TypeFlags.BooleanLiteral)) return { type: 'boolean' };
    if (members.length === 1) return schemaType(members[0]);
    throw new Error(`Unsupported union: ${checker.typeToString(type)}`);
  }
  if (type.flags & ts.TypeFlags.String) return { type: 'string' };
  if (type.flags & ts.TypeFlags.Number) return { type: 'number' };
  if (type.flags & ts.TypeFlags.Boolean) return { type: 'boolean' };
  throw new Error(`Unsupported option type: ${checker.typeToString(type)}`);
}
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
const nonblank = { type: 'string', pattern: '\\S' };
const optionSchemas = {};
for (const name of ['StetOptions', 'ArrowOptions', 'StickyOptions']) {
  const type = checker.getTypeAtLocation(declarations.get(name));
  const properties = {}, required = [];
  for (const prop of type.getProperties()) {
    properties[prop.name] = schemaType(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration));
    if (['text', 'label', 'description'].includes(prop.name)) properties[prop.name].pattern = '\\S';
    if (!(prop.flags & ts.SymbolFlags.Optional)) required.push(prop.name);
  }
  optionSchemas[name] = object(properties, required);
}
const markKind = schemaType(checker.getTypeAtLocation(declarations.get('MarkKind')));
const target = object({ strategy: { enum: strategies, type: 'string' }, file: nonblank, locator: nonblank, description: nonblank, rationale: nonblank }, ['strategy', 'file', 'locator', 'description']);
target.allOf = [{ if: { properties: { strategy: { const: 'css' } }, required: ['strategy'] }, then: { properties: { rationale: nonblank }, required: ['rationale'] } }];
const annotations = Object.entries(primitives).map(([name, meta]) => object({
  id: { type: 'string', pattern: '^[a-zA-Z0-9][a-zA-Z0-9._-]*$' },
  primitive: { const: name, type: 'string' },
  targets: { type: 'array', items: target, minItems: meta.targets.length, maxItems: meta.targets.length },
  options: optionSchemas[meta.type],
  ...(name === 'mark' ? { kind: markKind } : {}),
}, ['id', 'primitive', 'targets', ...(name === 'sticky' ? ['options'] : []), ...(name === 'mark' ? ['kind'] : [])]));
const plan = { $schema: 'http://json-schema.org/draft-07/schema#', title: 'Stet Annotation Plan v1', ...object({
  version: { type: 'integer', const: 1 },
  framework: { type: 'string', enum: Object.keys(frameworks) },
  intent: nonblank,
  annotations: { type: 'array', minItems: 1, items: { oneOf: annotations } },
}) };
const integrations = Object.fromEntries(Object.entries(frameworks).map(([name, meta]) => {
  const source = program.getSourceFile(resolve(root, `src/${name === 'vanilla' ? 'index' : name}.ts`));
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(source)).filter(s => {
    const symbol = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
    return symbol.flags & ts.SymbolFlags.Value;
  }).map(s => s.name);
  const symbols = Object.fromEntries(Object.keys(primitives).map(primitive => {
    const title = primitive[0].toUpperCase() + primitive.slice(1);
    const symbol = name === 'react' ? title : name === 'vue' ? `vStet${title}` : name === 'angular' ? `Stet${title}Directive` : primitive;
    if (!exported.includes(symbol)) throw new Error(`Missing source export: ${name}/${symbol}`);
    return [primitive, symbol];
  }));
  if (exported.length !== Object.keys(primitives).length) throw new Error(`Uncatalogued runtime exports in ${name}: ${exported}`);
  return [name, { ...meta, import: pkg.name + meta.subpath, symbols }];
}));
for (const [name, meta] of Object.entries(primitives)) {
  const source = program.getSourceFile(resolve(root, 'src/primitives.ts'));
  const fn = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  const targets = fn.parameters.filter(p => checker.typeToString(checker.getTypeAtLocation(p)) === 'Element');
  if (targets.length !== meta.targets.length) throw new Error(`Target arity drift: ${name}`);
}
const capabilities = {
  contractVersion: 1, package: { name: pkg.name, version: pkg.version, exports: Object.keys(pkg.exports) },
  frameworks: integrations,
  primitives: Object.fromEntries(Object.entries(primitives).map(([name, meta]) => [name, {
    ...meta, targetType: 'Element', options: optionSchemas[meta.type], defaults: Object.fromEntries(Object.keys(optionSchemas[meta.type].properties).filter(k => k in defaults || k === 'padding' && meta.padding !== undefined).map(k => [k, k === 'padding' ? meta.padding : defaults[k]])),
    ...(name === 'mark' ? { kind: markKind } : {}),
    effects: name === 'highlight' ? 'fill controls wash; stroke/width have no visible effect; padding positions the overlay' : name === 'arrow' ? 'fill/padding have no visible effect; curvature is clamped to -0.8…0.8' : name === 'sticky' ? 'fill controls paper; stroke controls text; width has no visible effect' : 'fill has no visible effect',
  }])),
  targetPreference: strategies, constraints, tools,
  cli: { node: '>=20', commands: ['inspect', 'schema annotation-plan|capabilities', 'validate <file>', 'snippet <primitive> --framework <framework>', 'agent init|update --tool <tool>', '--help', '--version'], exitCodes: { success: 0, invalidPlan: 1, usage: 2, io: 3, conflict: 4 } },
};
// A version-specific exact schema makes stale or hand-edited capability snapshots detectable.
const capSchema = { $schema: plan.$schema, title: `Stet ${pkg.version} capabilities`, type: 'object', const: capabilities };
function typeOf(schema) {
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map(x => JSON.stringify(x)).join(' | ');
  if (schema.oneOf) return schema.oneOf.map(typeOf).join(' | ');
  if (schema.type === 'object') return '{\n' + Object.entries(schema.properties).map(([k,v]) => `${JSON.stringify(k)}${schema.required.includes(k) ? '' : '?'}: ${typeOf(v)};`).join('\n') + '\n}';
  if (schema.type === 'array') return schema.minItems === schema.maxItems && schema.maxItems ? `[${Array(schema.minItems).fill(typeOf(schema.items)).join(', ')}]` : `Array<${typeOf(schema.items)}>`;
  return schema.type === 'integer' ? 'number' : schema.type;
}
const ajv = new Ajv({ allErrors: true, code: { source: true, esm: true }, strict: true });
const validate = ajv.compile(plan);
const outputs = {
  'agent/schemas/annotation-plan.schema.json': JSON.stringify(plan, null, 2) + '\n',
  'agent/schemas/capabilities.schema.json': JSON.stringify(capSchema, null, 2) + '\n',
  'agent/capabilities.json': JSON.stringify(capabilities, null, 2) + '\n',
  'agent/annotation-plan.d.ts': '// Generated by scripts/agent/generate.mjs. Do not edit.\nexport type AnnotationPlan = ' + typeOf(plan) + ';\n',
  'agent/LICENSE-ajv.txt': readFileSync(resolve(root, 'node_modules/ajv/LICENSE'), 'utf8'),
  'agent/validate.generated.mjs': '// Generated by Ajv (MIT); see LICENSE-ajv.txt. Do not edit.\n' + standaloneCode(ajv, validate) + '\n',
};
for (const framework of Object.keys(frameworks)) for (const primitive of Object.keys(primitives)) {
  const result = snippet(primitive, framework);
  if (result.extension !== frameworks[framework].extension) throw new Error(`Template extension drift: ${framework}`);
  outputs[`agent/templates/${framework}/${primitive}.${result.extension}`] = result.code;
}
const routes = JSON.parse(readFileSync(resolve(root, 'agent/evals/routing.json'), 'utf8'));
for (const skill of readdirSync(resolve(root, 'agent/skills')).sort()) {
  outputs[`agent/skills/${skill}/evals/trigger_evals.json`] = JSON.stringify(routes.map(route => ({ query: route.query, should_trigger: route.expected === skill, note: `Entry skill: ${route.expected}` })), null, 2) + '\n';
}
let stale = false;
for (const [path, content] of Object.entries(outputs)) {
  if (process.argv.includes('--check')) {
    let existing;
    try { existing = readFileSync(resolve(root, path), 'utf8'); } catch {}
    if (existing !== content) { console.error(`Stale generated artifact: ${path}`); stale = true; }
  } else {
    mkdirSync(resolve(root, path, '..'), { recursive: true });
    writeFileSync(resolve(root, path), content);
  }
}
if (stale) process.exitCode = 1;
