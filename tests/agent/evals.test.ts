// @vitest-environment node
import { expect, it } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
it('scores complete synthetic routes and rejects mismatches or missing cases', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'stet-eval-'));
  try {
    const fixtures = JSON.parse(readFileSync('agent/evals/routing.json','utf8'));
    const input = { model: 'synthetic-test-only', predictions: fixtures.map((f: any) => ({ query: f.query, selected: f.expected })) };
    const file = join(cwd,'predictions.json');
    const run = () => { writeFileSync(file,JSON.stringify(input)); const result = spawnSync(process.execPath,[resolve('scripts/agent/eval-routing.mjs'),file],{encoding:'utf8'}); if(result.error) throw result.error; return result; };
    expect(JSON.parse(run().stdout).ok).toBe(true);
    input.predictions[0].selected = 'none'; expect(run().status).toBe(1);
    input.predictions.pop(); expect(run().status).toBe(2);
  } finally { rmSync(cwd,{recursive:true,force:true}); }
});
