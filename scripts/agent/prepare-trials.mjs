// Prepare bounded local evaluation inputs. Never invokes a model or executes its output.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, readdirSync, symlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const root = resolve('.');
const out = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(join(tmpdir(), 'stet-trials-'));
mkdirSync(out, { recursive: true });
const [pack] = JSON.parse(execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', out], { encoding: 'utf8' }));
const metadata = [];
for (const [id, framework, scenario, skills] of [
  ...['vanilla','react','vue','svelte','angular'].map(f => [`settings-${f}`,f,'settings',true]),
  ['review-react','react','review',true], ['showcase-react','react','showcase',true],
  ['recovery-react','react','recovery',true], ['baseline-react','react','settings',false],
]) {
  const dir = join(out, id); mkdirSync(dir); cpSync(`tests/trials/apps/${framework}`, dir, {recursive:true}); cpSync('tests/trials/build.mjs',join(dir,'build.mjs'));
  writeFileSync(join(dir,'app.json'),JSON.stringify({framework}));
  const deps = framework === 'vanilla' ? {} : {[framework === 'angular' ? '@angular/core' : framework]:'*'};
  // Install only Stet here; existing development compilers are linked separately.
  writeFileSync(join(dir,'package.json'),JSON.stringify({name:'settings-app',private:true,type:'module',scripts:{check:'node build.mjs',build:'node build.mjs'}},null,2));
  execFileSync('npm',['install',join(out,pack.filename),'--ignore-scripts','--offline'],{cwd:dir,stdio:'pipe'});
  const pkg=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));Object.assign(pkg.dependencies,deps);writeFileSync(join(dir,'package.json'),JSON.stringify(pkg,null,2));
  for(const name of readdirSync('node_modules')) if(!name.startsWith('.') && name!=='@funsaized') symlinkSync(join(root,'node_modules',name),join(dir,'node_modules',name),'junction');
  if(skills) execFileSync(process.execPath,[join(dir,'node_modules/@funsaized/stet/agent/cli.mjs'),'agent','init','--tool','codex'],{cwd:dir});
  const prompt=readFileSync(`tests/trials/prompts/${scenario}.txt`,'utf8') + '\nUse only this app and its installed package. Do not inspect the Stet repository, other trial apps, or scoring materials. Do not install dependencies, invoke other agents, publish, or use paid services.\n' + (skills ? '' : '\nFor this ordinary-documentation baseline use the installed package README and public API types. Do not use its agent CLI, templates or skills.\n');
  writeFileSync(join(out,`${id}.prompt.txt`),prompt);
  metadata.push({id,framework,scenario,skills,directory:dir,prompt:`${id}.prompt.txt`});
}
const routes=JSON.parse(readFileSync('agent/evals/routing.json','utf8')).map(({query})=>query);
const descriptions=readdirSync('agent/skills').sort().map(name=>({name,description:readFileSync(`agent/skills/${name}/SKILL.md`,'utf8').match(/^description: (.*)$/m)[1]}));
writeFileSync(join(out,'routing.prompt.txt'),'Choose exactly one entry skill or none for each query, using only the supplied descriptions. Do not use tools. Return JSON {"predictions":[{"query":"exact query","selected":"skill name or none"}]}.\n'+JSON.stringify({skills:descriptions,queries:routes},null,2));
writeFileSync(join(out,'manifest.json'),JSON.stringify({preparedAt:new Date().toISOString(),packageVersion:JSON.parse(readFileSync('package.json','utf8')).version,trials:metadata},null,2));
console.log(out);
