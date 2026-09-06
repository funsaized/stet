// @vitest-environment node
import { it, expect } from 'vitest';
import { cpSync, mkdtempSync, symlinkSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

it('detects deliberate export, option type and catalog default drift in an isolated copy', () => {
  const dir = mkdtempSync(join(tmpdir(), 'stet-drift-'));
  try {
    for (const path of ['src', 'agent', 'scripts', 'package.json']) cpSync(path, join(dir, path), { recursive: true });
    symlinkSync(resolve('node_modules'), join(dir, 'node_modules'), 'junction');
    for (const [path, from, to, expected] of [
      ['src/index.ts', 'circle,', 'circle as renamedCircle,', 'Missing source export'],
      ['src/mount.ts', 'seed?: number', 'seed?: string', 'Generated example violates the plan schema'],
      ['agent/catalog.mjs', 'boil: 0', 'boil: 0.5', 'Stale generated artifact'],
    ]) {
      const file = join(dir, path), original = readFileSync(file, 'utf8');
      expect(original).toContain(from);
      writeFileSync(file, original.replace(from, to));
      const result = spawnSync(process.execPath, ['scripts/agent/generate.mjs', '--check'], { cwd: dir, encoding: 'utf8' });
      expect(result.error).toBeUndefined(); expect(result.status).not.toBe(0); expect(result.stderr).toContain(expected);
      writeFileSync(file, original);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
}, 30000);
