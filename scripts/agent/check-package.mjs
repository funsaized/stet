import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
const cwd = mkdtempSync(join(tmpdir(), 'stet-package-'));
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...options });
try {
  run('npm', ['run', 'build'], { stdio: 'inherit' });
  const [pack] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--cache', join(cwd, 'cache'), '--pack-destination', cwd]));
  const paths = new Set(pack.files.map(f => f.path));
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const path of ['agent/cli.mjs', 'agent/LICENSE-ajv.txt', 'agent/index.d.ts', 'agent/annotation-plan.d.ts', 'agent/validate.generated.mjs', 'agent/capabilities.json', 'agent/schemas/annotation-plan.schema.json', 'agent/schemas/capabilities.schema.json', 'style.css', 'style.css.d.ts']) assert(paths.has(path), `Missing packed ${path}`);
  for (const name of ['index', 'mount', 'primitives', 'rough', 'prng', 'react', 'vue', 'svelte', 'angular']) for (const ext of ['js','d.ts']) assert(paths.has(`dist/${name}.${ext}`));
  function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
  for (const path of [...walk('agent/skills'), ...walk('agent/templates')]) assert(paths.has(path), `Missing packed ${path}`);
  const app = join(cwd, 'consumer'); mkdirSync(app);
  writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'stet-package-consumer', private: true, type: 'module' }));
  run('npm', ['install', join(cwd, pack.filename), '--ignore-scripts', '--offline', '--cache', join(cwd, 'cache')], { cwd: app });
  const cli = join(app, 'node_modules/.bin/stet');
  const inspected = JSON.parse(run(cli, ['inspect', '--json'], { cwd: app }));
  assert.equal(inspected.capabilities.package.version, pkg.version);
  assert.equal(inspected.capabilities.package.name, pkg.name);
  assert.equal(JSON.parse(run(cli, ['schema', 'annotation-plan'], { cwd: app })).properties.version.const, 1);
  for (const framework of Object.keys(inspected.capabilities.frameworks)) for (const primitive of Object.keys(inspected.capabilities.primitives)) assert(JSON.parse(run(cli, ['snippet', primitive, '--framework', framework, '--json'], { cwd: app })).code.includes('@funsaized/stet'));
  const fixture = JSON.parse(readFileSync('agent/evals/plans.json', 'utf8'))[0].plan;
  writeFileSync(join(app, 'plan.json'), JSON.stringify(fixture));
  assert.equal(JSON.parse(run(cli, ['validate', 'plan.json', '--json'], { cwd: app })).ok, true);
  assert.equal(JSON.parse(run(cli, ['agent', 'init', '--tool', 'codex', '--json'], { cwd: app })).skills.length, 4);
  assert.deepEqual(JSON.parse(run(cli, ['agent', 'update', '--tool', 'codex', '--json'], { cwd: app })).changed, []);
  writeFileSync(join(app, 'smoke.mjs'), `import assert from 'node:assert/strict';
import * as core from '@funsaized/stet';
import * as actions from '@funsaized/stet/svelte';
import * as directives from '@funsaized/stet/vue';
import { validatePlan } from '@funsaized/stet/agent';
assert.equal(typeof core.circle, 'function'); assert.equal(typeof actions.arrow, 'function'); assert(directives.vStetCircle);
assert.equal(validatePlan({}).ok, false);
for (const subpath of ['', '/react', '/vue', '/svelte', '/angular', '/style.css', '/agent', '/agent/capabilities.json', '/agent/schemas/annotation-plan.schema.json']) assert(import.meta.resolve('@funsaized/stet' + subpath));
`);
  run(process.execPath, ['smoke.mjs'], { cwd: app });
  writeFileSync(join(app, 'types.ts'), `import { validatePlan, type AnnotationPlan } from '@funsaized/stet/agent';
const plan = ${JSON.stringify(fixture)} satisfies AnnotationPlan;
const ok: boolean = validatePlan(plan).ok;
// @ts-expect-error Unsupported framework must be rejected by packed declarations.
const wrongFramework: AnnotationPlan['framework'] = 'solid';
// @ts-expect-error Sticky requires options.text.
const missingText: AnnotationPlan['annotations'][number] = { id: 'note', primitive: 'sticky', targets: ${JSON.stringify(fixture.annotations[0].targets)} };
// @ts-expect-error Arrow requires exactly two targets.
const missingDestination: AnnotationPlan['annotations'][number] = { id: 'link', primitive: 'arrow', targets: ${JSON.stringify(fixture.annotations[0].targets)} };
`);
  run(process.execPath, [resolve('node_modules/typescript/bin/tsc'), '--strict', '--noEmit', '--skipLibCheck', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'types.ts'], { cwd: app });
  const bundles = {};
  for (const [label, source] of Object.entries({ circle: 'import { circle } from "@funsaized/stet"; console.log(circle);', full: 'import * as stet from "@funsaized/stet"; console.log(stet);' })) {
    const bundle = await build({ stdin: { contents: source, resolveDir: app }, bundle: true, write: false, minify: true, platform: 'browser', format: 'esm', metafile: true });
    assert(Object.keys(bundle.metafile.inputs).every(p => !p.includes('/agent/') && !p.includes('node:')), 'Agent infrastructure leaked into browser bundle');
    bundles[label] = gzipSync(bundle.outputFiles[0].contents).length;
  }
  assert(bundles.circle < bundles.full, 'Unused primitives were not tree-shaken');
  // The only required installed package should be Stet; peers remain optional.
  const lock = JSON.parse(readFileSync(join(app, 'package-lock.json'), 'utf8'));
  assert.deepEqual(Object.keys(lock.packages).sort(), ['', 'node_modules/@funsaized/stet']);
  console.log(JSON.stringify({ ok: true, archiveBytes: pack.size, unpackedBytes: pack.unpackedSize, files: pack.files.length, consumerRuntimeDependencies: 0, browserGzipBytes: bundles }, null, 2));
} finally { rmSync(cwd, { recursive: true, force: true }); }
