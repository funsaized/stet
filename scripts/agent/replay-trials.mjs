// Replay retained application edits without invoking a model. This is not a new
// agent trial; raw first attempts and subsequent recoveries remain separate.
import { readFileSync, writeFileSync, cpSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

if (process.argv.length !== 3) {
  console.error('Usage: node scripts/agent/replay-trials.mjs <new-output-directory>');
  process.exit(2);
}
const out = resolve(process.argv[2]);
const evidence = resolve('tests/trials/evidence/v1-05/fresh');
const results = JSON.parse(readFileSync(join(evidence,'results.json'),'utf8'));
execFileSync(process.execPath,['scripts/agent/prepare-trials.mjs',out],{stdio:'inherit'});
const manifestPath = join(out,'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath,'utf8'));
for (const trial of manifest.trials) {
  const result = results.tasks.find(t => t.id === trial.id);
  if (!result) throw new Error(`No retained result for ${trial.id}`);
  const source = join(evidence,result.finalEvidence,'app');
  const ext = {react:'tsx',vue:'vue',svelte:'svelte'}[trial.framework] ?? 'ts';
  cpSync(join(source,`App.${ext}`),join(trial.directory,`App.${ext}`));
  cpSync(join(source,result.planFile),join(trial.directory,result.planFile));
  trial.plan = result.planFile;
  execFileSync(process.execPath,['build.mjs'],{cwd:trial.directory,stdio:'inherit'});
}
manifest.replay = {evidence:'tests/trials/evidence/v1-05/fresh',newModelRun:false};
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(`Retained edits rebuilt in ${out}; run playwright.trials.config.ts with STET_TRIAL_ROOT set to this directory.`);
