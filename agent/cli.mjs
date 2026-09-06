#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { frameworks, primitives } from './catalog.mjs';
import { inspectProject } from './project.mjs';
import { validatePlan } from './validate.mjs';
import { installSkills, Failure } from './install.mjs';

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const help = `stet — installed-version annotation tools (Node.js >=20)

  stet inspect [--project <directory>] [--json]
  stet schema annotation-plan|capabilities [--json]
  stet validate <plan.json> [--json]
  stet snippet <primitive> --framework <framework> [--json]
  stet snippet --pattern lifecycle --framework <framework> [--json]
  stet agent init|update --tool claude|cursor|opencode|codex [--json]
  stet --help [--json]
  stet --version [--json]

Primitives: ${Object.keys(primitives).join(', ')}
Frameworks: ${Object.keys(frameworks).join(', ')}
Run from the application directory. Init/update copy project skills only.
Update preserves local edits; conflicts require reconciliation. No force overwrite.
Schema always emits raw JSON. --json emits one JSON value, including failures.
Exit codes: 0 success; 1 invalid plan; 2 usage; 3 I/O/invalid JSON; 4 install conflict.
Validation checks an authoring plan, not live DOM targets or application correctness.
`;
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
function emit(value, human) { process.stdout.write(json || human === undefined ? JSON.stringify(value, null, 2) + '\n' : human + '\n'); }
function usage(message) { throw new Failure('USAGE', message + ' Run stet --help.', 2); }
try {
  const { values, positionals: p } = parseArgs({ args: argv, allowPositionals: true, strict: true, options: { json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean' }, framework: { type: 'string' }, tool: { type: 'string' }, pattern: { type: 'string' }, project: { type: 'string' } } });
  for (const flag of ['framework', 'tool', 'pattern', 'project']) if (values[flag] !== undefined && !values[flag].trim()) usage(`--${flag} requires a nonblank value`);
  const pkg = read('../package.json');
  if (!p.length && (values.framework || values.tool || values.pattern || values.project)) usage('Flags require a command');
  if (values.help || !p.length && !values.version) emit({ ok: true, help }, help.trimEnd());
  else if (values.version) { if (p.length || values.framework || values.tool || values.pattern || values.project) usage('--version accepts no command'); emit({ ok: true, package: pkg.name, version: pkg.version }, `${pkg.name} ${pkg.version}`); }
  else {
    const [command, argument] = p;
    if (p.length > 2) usage('Unexpected positional argument');
    if (values.project && command !== 'inspect') usage('Project is only supported by inspect');
    if (values.pattern && command !== 'snippet') usage('Pattern is only supported by snippet');
    if (values.framework && command !== 'snippet' || values.tool && command !== 'agent') usage('Flag is not supported by this command');
    if (command === 'inspect') {
      if (p.length !== 1) usage('inspect accepts no arguments');
      const capabilities = read('./capabilities.json');
      const project = values.project ? inspectProject(values.project) : undefined;
      emit({ ok: true, capabilities, ...(project ? { project } : {}) }, `${pkg.name}@${pkg.version}${project ? "\nProject: " + project.directory + "\nCandidates: " + (project.candidates.join(", ") || "unknown") + (project.ambiguous ? " (ambiguous)" : "") + (project.errors.length || project.truncated ? " (incomplete evidence; use --json)" : "") : ""}\n${Object.keys(capabilities.primitives).join(', ')}\nUse --json for options, defaults, imports, targeting and lifecycle constraints.`);
    } else if (command === 'schema') {
      if (!['annotation-plan', 'capabilities'].includes(argument)) usage('Choose schema annotation-plan or capabilities');
      emit(read(`./schemas/${argument}.schema.json`));
    } else if (command === 'validate') {
      if (!argument) usage('validate requires a JSON file');
      let plan;
      try { plan = JSON.parse(readFileSync(argument, 'utf8')); }
      catch (e) { throw new Failure(e instanceof SyntaxError ? 'INVALID_JSON' : 'IO_ERROR', e instanceof SyntaxError ? 'Cannot parse plan as JSON. Fix JSON syntax and retry.' : `Cannot read plan file (${e.code}).`, 3, argument); }
      const result = validatePlan(plan);
      if (json) emit(result);
      else if (result.ok) emit(result, `Valid annotation plan.${result.warnings.length ? '\n' + result.warnings.map(w => `${w.path}: ${w.code}: ${w.message}`).join('\n') : ''}`);
      else process.stderr.write(result.errors.map(e => `${e.path}: ${e.code}: ${e.message}`).join('\n') + '\n');
      if (!result.ok) process.exitCode = 1;
    } else if (command === 'snippet') {
      const framework = values.framework;
      if ((values.pattern ? values.pattern !== 'lifecycle' || argument !== undefined : !Object.hasOwn(primitives, argument)) || !Object.hasOwn(frameworks, framework)) usage('Choose an installed primitive and provide --framework');
      const extension = frameworks[framework].extension;
      const file = `templates/${framework}/${values.pattern ?? argument}.${extension}`;
      const code = readFileSync(new URL(file, import.meta.url), 'utf8');
      emit({ ok: true, ...(values.pattern ? { pattern: values.pattern } : { primitive: argument }), framework, file, code }, code.trimEnd());
    } else if (command === 'agent') {
      if (!['init', 'update'].includes(argument) || !values.tool) usage('Use agent init|update --tool <tool>');
      const result = installSkills(argument, values.tool, process.cwd());
      emit(result, `${result.changed.length ? 'Installed' : 'Already current'} Stet ${result.version} skills in ${result.directory}.`);
    } else usage(`Unknown command: ${command}`);
  }
} catch (error) {
  const e = error instanceof Failure ? error : new Failure(error.code?.startsWith('ERR_PARSE_ARGS') ? 'USAGE' : 'IO_ERROR', error.code?.startsWith('ERR_PARSE_ARGS') ? `${error.message} Run stet --help.` : `Unable to complete command (${error.code ?? 'unexpected error'}). Check package integrity and file permissions.`, error.code?.startsWith('ERR_PARSE_ARGS') ? 2 : 3);
  const result = { ok: false, errors: [{ path: e.path, code: e.code, message: e.message }] };
  if (json) emit(result);
  else process.stderr.write(`${e.code}: ${e.message}\n`);
  process.exitCode = e.exitCode;
}
