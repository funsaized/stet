// @vitest-environment node
import { it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, hostname } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
// @ts-expect-error Node-only agent implementation
import { installSkills } from '../../agent/install.mjs';
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
function fixture(run: (dir: string, dest: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'stet-recovery-'));
  try { run(dir, join(dir, '.agents/skills')); } finally { rmSync(dir, { recursive: true, force: true }); }
}
for (const phase of ['prepared', 'staged', 'written', 'committed']) it(`recovers an interrupted ${phase} update and preserves unrelated temporary files`, () => fixture((dir, dest) => {
  installSkills('init', 'codex', dir);
  const path = join(dest, 'stet/SKILL.md'), marker = join(dest, '.stet-managed.json');
  writeFileSync(path, 'old managed version');
  const manifest = JSON.parse(readFileSync(marker, 'utf8')); manifest.files['stet/SKILL.md'] = hash('old managed version');
  writeFileSync(marker, JSON.stringify(manifest));
  writeFileSync(path + '.stet-tmp', 'unowned old temporary file');
  expect(() => installSkills('update', 'codex', dir, (state: string) => { if (state === phase) throw Error('injected interruption'); })).toThrow('injected interruption');
  expect(existsSync(join(dest, '.stet-journal.json'))).toBe(true);
  expect(installSkills('update', 'cursor', dir).recovered).toBe(true);
  expect(readFileSync(path, 'utf8')).toBe(readFileSync('agent/skills/stet/SKILL.md', 'utf8'));
  expect(readFileSync(path + '.stet-tmp', 'utf8')).toBe('unowned old temporary file');
  expect(installSkills('update', 'opencode', dir).changed).toEqual([]);
  expect(existsSync(join(dest, '.stet-journal.json'))).toBe(false);
}));
it('preserves edits after interruption and rejects overlapping invocations', () => fixture((dir, dest) => {
  expect(() => installSkills('init', 'codex', dir, (state: string) => {
    if (state === 'prepared') {
      expect(() => installSkills('init', 'cursor', dir)).toThrow(/active/);
      throw Error('stop');
    }
  })).toThrow('stop');
  mkdirSync(join(dest, 'stet'), { recursive: true });
  writeFileSync(join(dest, 'stet/SKILL.md'), 'human edit');
  expect(() => installSkills('init', 'codex', dir)).toThrow(/changed since preparation/);
  expect(readFileSync(join(dest, 'stet/SKILL.md'), 'utf8')).toBe('human edit');
}));
it('rejects malformed or escaping recovery records and uncertain lock owners', () => fixture((dir, dest) => {
  installSkills('init', 'codex', dir);
  writeFileSync(join(dest, '.stet-journal.json'), '{');
  expect(() => installSkills('update', 'codex', dir)).toThrow(/malformed/);
  rmSync(join(dest, '.stet-journal.json'));
  mkdirSync(join(dest, '.stet-lock'));
  writeFileSync(join(dest, '.stet-lock/owner.json'), JSON.stringify({ host: hostname() + '-other', pid: process.pid, token: randomUUID() }));
  expect(() => installSkills('update', 'codex', dir)).toThrow(/ownership is unknown/);
}));

it('recovers a dead process lock after abrupt termination during a content write', () => fixture((dir, dest) => {
  const module = pathToFileURL(resolve('agent/install.mjs')).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { installSkills } from ${JSON.stringify(module)}; installSkills('init', 'codex', ${JSON.stringify(dir)}, state => { if (state === 'written') process.exit(73); });`]);
  expect(result.error).toBeUndefined(); expect(result.status).toBe(73);
  expect(existsSync(join(dest, '.stet-lock'))).toBe(true);
  expect(installSkills('init', 'codex', dir).recovered).toBe(true);
  expect(existsSync(join(dest, '.stet-lock'))).toBe(false);
}));
