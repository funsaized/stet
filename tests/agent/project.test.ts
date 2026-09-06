// @vitest-environment node
import { expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
// @ts-expect-error Node-only project inspection
import { inspectProject } from '../../agent/project.mjs';
const fixture = (run: (dir: string, put: (name: string, content: object | string) => void) => void) => {
  const dir = mkdtempSync(join(tmpdir(), 'stet-project-'));
  const put = (name: string, content: object | string) => { const path = join(dir, name); mkdirSync(resolve(path, '..'), { recursive: true }); writeFileSync(path, typeof content === 'string' ? content : JSON.stringify(content)); };
  try { run(dir, put); } finally { rmSync(dir, { recursive: true, force: true }); }
};
for (const [framework, dependency] of Object.entries({ vanilla: null, react: 'react', vue: 'vue', svelte: 'svelte', angular: '@angular/core' })) it(`discovers ${framework} without executing declared checks`, () => fixture((dir, put) => {
  put('package.json', { dependencies: dependency ? { [dependency]: '*' } : {}, scripts: { check: 'touch SHOULD_NOT_EXIST', start: 'do-not-run' } });
  put('index.html', '<button>Save</button>');
  const result = inspectProject(dir);
  expect(result.candidates).toEqual([framework]); expect(result.ambiguous).toBe(false);
  expect(result.packages[0].checks).toEqual({ check: 'touch SHOULD_NOT_EXIST' });
  expect(result.installed).toBeNull();
  expect(readdirSync(dir)).toEqual(['index.html', 'package.json']);
  expect(inspectProject(dir)).toEqual(result);
}));
it('reports nested multi-app ambiguity, hoisted installation and source evidence', () => fixture((dir, put) => {
  put('package.json', { workspaces: ['apps/*'] });
  put('apps/a/package.json', { dependencies: { react: '*', '@funsaized/stet': '^0.0.2' } });
  put('apps/b/package.json', { dependencies: { vue: '*' } });
  put('apps/a/src/App.tsx', "import React from 'react';");
  put('node_modules/@funsaized/stet/package.json', { name: '@funsaized/stet', version: '0.0.2', bin: { stet: './agent/cli.mjs' } });
  put('node_modules/@funsaized/stet/agent/cli.mjs', 'throw Error("never execute");');
  const result = inspectProject(dir);
  expect(result.candidates).toEqual(['react', 'vue']); expect(result.ambiguous).toBe(true);
  expect(result.packages.find((p: any) => p.path === 'apps/a/package.json').installed.version).toBe('0.0.2');
  expect(result.evidence.some((e: any) => e.kind === 'source-import')).toBe(true);
  expect(inspectProject(join(dir, 'apps/a')).installed.binary).toContain('node_modules');
}));
it('keeps malformed manifests, missing dependencies and bounded scans explicit', () => fixture((dir, put) => {
  put('package.json', '{'); put('src/App.svelte', '<button>Save</button>');
  put('src/deep/a/b/c/d/hidden.vue', '<template/>');
  const result = inspectProject(dir);
  expect(result.candidates).toEqual(['svelte']); expect(result.errors[0].code).toBe('PROJECT_MANIFEST'); expect(result.truncated).toBe(true);
  put('package.json', { dependencies: { react: '*', vue: '*' } });
  expect(inspectProject(dir).ambiguous).toBe(true);
}));
it('preserves CLI capability payload and validates bundled illustrative plan', () => fixture((dir, put) => {
  put('package.json', {}); put('index.html', '<button>Save</button>');
  const cli = resolve('agent/cli.mjs');
  const run = (args: string[]) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
  const result = run(['inspect', '--project', dir, '--json']);
  expect(result.status).toBe(0); expect(result.stderr).toBe('');
  expect(JSON.parse(result.stdout).capabilities).toEqual(JSON.parse(run(['inspect', '--json']).stdout).capabilities);
  expect(run(['validate', 'agent/examples/settings.plan.json', '--json']).status).toBe(0);
  expect(run(['schema', 'annotation-plan', '--project', dir, '--json']).status).toBe(2);
}));
