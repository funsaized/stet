// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, symlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const cli = resolve('agent/cli.mjs');
const dirs: string[] = [];
const temporary = () => { const p = mkdtempSync(join(tmpdir(), 'stet-agent-')); dirs.push(p); return p; };
const run = (args: string[], cwd = process.cwd()) => {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
};
afterEach(() => dirs.splice(0).forEach(p => rmSync(p, { recursive: true, force: true })));
const plan = { version: 1, framework: 'react', intent: 'explain', annotations: [{ id: 'save', primitive: 'circle', targets: [{ strategy: 'ref', file: 'src/App.tsx', locator: 'saveRef', description: 'Save button' }], options: { seed: 42, description: 'Save your changes.' } }] };

describe('CLI subprocess contract', () => {
  it('prints help/version and repeatable JSON with empty stderr', () => {
    for (const args of [['--help'], ['--version'], ['inspect'], ['schema', 'annotation-plan'], ['schema', 'capabilities'], ['snippet', 'circle', '--framework', 'react']]) {
      const a = run([...args, '--json']), b = run([...args, '--json']);
      expect(a.status).toBe(0); expect(a.stderr).toBe(''); expect(a.stdout).toBe(b.stdout); expect(JSON.parse(a.stdout)).toBeTruthy();
    }
    expect(run(['--help']).stdout).toContain('Exit codes:');
  });
  it('rejects unknown commands, extra flags and invalid snippet names', () => {
    for (const args of [['inspect', '--project', ''], ['inspect', '--pattern', ' '], ['--version', '--tool', ''], ['wat'], ['--framework', 'react'], ['inspect', '', ''], ['inspect', '--tool', 'claude'], ['schema', '../../package'], ['snippet', 'box', '--framework', 'react'], ['snippet', 'circle', '--framework', 'solid'], ['inspect', 'extra'], ['validate'], ['inspect', '--bogus'], ['agent', 'init', '--tool', 'toString']]) {
      const result = run([...args, '--json']); expect(result.status, args.join(' ')).toBe(2); expect(JSON.parse(result.stdout).ok).toBe(false); expect(result.stderr).toBe('');
    }
    expect(run(['wat']).stderr).toContain('USAGE'); expect(run(['wat']).stdout).toBe('');
  });
  it('validates files and distinguishes invalid plans, syntax and I/O', () => {
    const cwd = temporary(); writeFileSync(join(cwd, 'plan.json'), JSON.stringify(plan));
    expect(JSON.parse(run(['validate', 'plan.json', '--json'], cwd).stdout)).toEqual({ ok: true, errors: [], warnings: [] });
    writeFileSync(join(cwd, 'plan.json'), JSON.stringify({ ...plan, version: 2 }));
    const invalid = run(['validate', 'plan.json', '--json'], cwd); expect(invalid.status).toBe(1); expect(JSON.parse(invalid.stdout).errors[0].path).toBe('version');
    expect(run(['validate', 'plan.json'], cwd).stderr).toContain('version');
    writeFileSync(join(cwd, 'plan.json'), '{'); expect(run(['validate', 'plan.json', '--json'], cwd).status).toBe(3);
    expect(run(['validate', 'absent.json', '--json'], cwd).status).toBe(3);
  });
});
for (const [tool, path] of Object.entries({ claude: '.claude/skills', cursor: '.agents/skills', opencode: '.agents/skills', codex: '.agents/skills' })) {
  it(`installs and updates ${tool} idempotently without touching unrelated config`, () => {
    const cwd = temporary(); writeFileSync(join(cwd, 'AGENTS.md'), 'personal instructions');
    const args = ['agent', 'init', '--tool', tool, '--json'];
    expect(run(args, cwd).status).toBe(0); expect(existsSync(join(cwd, path, 'stet/SKILL.md'))).toBe(true);
    expect(JSON.parse(run(args, cwd).stdout).changed).toEqual([]);
    expect(JSON.parse(run(['agent', 'update', '--tool', tool, '--json'], cwd).stdout).changed).toEqual([]);
    expect(readFileSync(join(cwd, 'AGENTS.md'), 'utf8')).toBe('personal instructions');
    const file = join(cwd, path, 'stet/SKILL.md'); writeFileSync(file, 'my local skill');
    const result = run(['agent', 'update', '--tool', tool, '--json'], cwd);
    expect(result.status).toBe(4); expect(JSON.parse(result.stdout).errors[0].code).toBe('LOCAL_CHANGES'); expect(readFileSync(file, 'utf8')).toBe('my local skill');
  });
}
it('preflights conflicts before copying any skills; protects symlinks', () => {
  const cwd = temporary(); mkdirSync(join(cwd, '.agents/skills/stet-showcase-ui'), { recursive: true });
  writeFileSync(join(cwd, '.agents/skills/stet-showcase-ui/SKILL.md'), 'custom');
  expect(run(['agent', 'init', '--tool', 'codex', '--json'], cwd).status).toBe(4);
  expect(existsSync(join(cwd, '.agents/skills/stet'))).toBe(false);
  const other = temporary(); const outside = temporary(); symlinkSync(outside, join(other, '.agents'));
  expect(run(['agent', 'init', '--tool', 'codex', '--json'], other).status).toBe(4);
  expect(existsSync(join(outside, 'skills'))).toBe(false);
});
it('updates a previously managed version and rejects deleted/invalid managed files', () => {
  const cwd = temporary(); const args = ['agent', 'update', '--tool', 'codex', '--json'];
  expect(run(args, cwd).status).toBe(4); run(['agent', 'init', '--tool', 'codex', '--json'], cwd);
  const file = join(cwd, '.agents/skills/stet/SKILL.md'); const marker = join(cwd, '.agents/skills/.stet-managed.json');
  const original = readFileSync(file, 'utf8'); writeFileSync(file, 'older official version');
  const manifest = JSON.parse(readFileSync(marker, 'utf8')); manifest.files['stet/SKILL.md'] = createHash('sha256').update('older official version').digest('hex'); writeFileSync(marker, JSON.stringify(manifest));
  expect(run(args, cwd).status).toBe(0); expect(readFileSync(file, 'utf8')).toBe(original);
  rmSync(file); expect(run(args, cwd).status).toBe(4);
  writeFileSync(marker, '{}'); expect(JSON.parse(run(args, cwd).stdout).errors[0].code).toBe('INVALID_MANIFEST');
});
