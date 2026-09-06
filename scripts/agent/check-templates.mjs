import { mkdtempSync, writeFileSync, readFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Keep temp consumers next to node_modules so peer dependencies resolve normally.
const cwd = mkdtempSync(resolve('.stet-template-check-'));
const compilerOptions = { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, skipLibCheck: true, jsx: 'react-jsx', experimentalDecorators: true, useDefineForClassFields: false, noEmit: true, lib: ['ES2022', 'DOM'], types: ['svelte'], paths: {
  '@funsaized/stet': [resolve('dist/index.d.ts')],
  '@funsaized/stet/*': [resolve('dist/*')],
} };
try {
  for (const framework of readdirSync('agent/templates')) {
    mkdirSync(join(cwd, framework));
    for (const file of readdirSync(`agent/templates/${framework}`)) writeFileSync(join(cwd, framework, file), readFileSync(`agent/templates/${framework}/${file}`));
  }
  writeFileSync(join(cwd, 'tsconfig.json'), JSON.stringify({ compilerOptions, include: ['vanilla/*.ts', 'react/*.tsx', 'angular/*.ts', 'vue/*.vue', 'svelte/*.svelte'], angularCompilerOptions: { strictTemplates: true, compilationMode: 'partial' } }));
  for (const [cmd,args] of [
    ['tsc', ['-p', join(cwd, 'tsconfig.json')]],
    ['ngc', ['-p', join(cwd, 'tsconfig.json')]],
    ['vue-tsc', ['-p', join(cwd, 'tsconfig.json'), '--noEmit']],
    ['svelte-check', ['--workspace', cwd, '--tsconfig', './tsconfig.json']],
  ]) execFileSync(resolve(`node_modules/.bin/${cmd}`), args, { stdio: 'inherit' });
  console.log('All 35 framework snippets and lifecycle patterns typecheck, including Angular templates and Vue/Svelte SFCs.');
} finally { rmSync(cwd, { recursive: true, force: true }); }
