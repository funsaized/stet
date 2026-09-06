// Runs with the tested Node version; no development framework/compiler imports.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const archive = resolve(process.argv[2] ?? 'missing-archive');
assert(existsSync(archive), 'Pass an actual Stet tarball');
assert(process.env.npm_execpath, 'Run through npm run test:cli-consumer -- <archive>');
const cwd = mkdtempSync(join(tmpdir(), 'stet-cli-consumer-'));
const run = (args, dir = cwd) => { const r = spawnSync(process.execPath, args, {cwd:dir,encoding:'utf8'}); assert.ifError(r.error); return r; };
try {
  writeFileSync(join(cwd,'package.json'),JSON.stringify({name:'stet-cli-consumer',private:true,type:'module'}));
  const installed=run([process.env.npm_execpath,'install',archive,'--ignore-scripts','--offline']);assert.equal(installed.status,0,installed.stderr);
  const cli=join(cwd,'node_modules/@funsaized/stet/agent/cli.mjs');
  assert(existsSync(join(cwd,'node_modules/.bin',process.platform==='win32'?'stet.cmd':'stet')));
  const bin=run([process.env.npm_execpath,'exec','--offline','--','stet','--version','--json']);assert.equal(bin.status,0,bin.stderr);assert(JSON.parse(bin.stdout).version);
  const json=(args,status=0)=>{const r=run([cli,...args,'--json']);assert.equal(r.status,status,r.stdout+r.stderr);assert.equal(r.stderr,'');return JSON.parse(r.stdout);};
  const caps=json(['inspect']).capabilities;
  assert.equal(json(['inspect','--project',cwd]).project.installed.version,caps.package.version);
  for(const f of Object.keys(caps.frameworks)) { assert(json(['snippet','--pattern','lifecycle','--framework',f]).code);for(const p of Object.keys(caps.primitives)) assert(json(['snippet',p,'--framework',f]).code); }
  assert(json(['schema','annotation-plan']).properties.version.const===1);
  const plan=join(cwd,'node_modules/@funsaized/stet/agent/examples/settings.plan.json');assert(json(['validate',plan]).ok);
  writeFileSync(join(cwd,'bad.json'),'{');assert.equal(json(['validate','bad.json'],3).errors[0].code,'INVALID_JSON');
  assert.equal(json(['wrong-command'],2).errors[0].code,'USAGE');
  for(const tool of ['codex','cursor','opencode','claude']) {json(['agent','init','--tool',tool]);assert.deepEqual(json(['agent','update','--tool',tool]).changed,[]);}
  const managed=join(cwd,'.agents/skills/stet/SKILL.md');writeFileSync(managed,'human edit');assert.equal(json(['agent','update','--tool','codex'],4).errors[0].code,'LOCAL_CHANGES');assert.equal(readFileSync(managed,'utf8'),'human edit');
  const linkProject=join(cwd,'symlink-project');mkdirSync(join(linkProject,'.agents'),{recursive:true});
  let symlinks='tested';
  try {symlinkSync(join(cwd,'.agents/skills'),join(linkProject,'.agents/skills'),'junction');}
  catch(e){if(['EPERM','EACCES','ENOSYS'].includes(e.code))symlinks=`unavailable: ${e.code}`;else throw e;}
  if(symlinks==='tested'){const r=run([cli,'agent','init','--tool','codex','--json'],linkProject);assert.equal(r.status,4);assert.equal(JSON.parse(r.stdout).errors[0].code,'SYMLINK_CONFLICT');}
  assert.deepEqual(Object.keys(JSON.parse(readFileSync(join(cwd,'package-lock.json'),'utf8')).packages).sort(),['','node_modules/@funsaized/stet']);
  console.log(JSON.stringify({ok:true,node:process.version,platform:process.platform,symlinks,requiredDependencies:0}));
} finally {rmSync(cwd,{recursive:true,force:true});}
