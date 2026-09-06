import { build } from 'esbuild';
import { parse, compileScript } from '@vue/compiler-sfc';
import { compile } from 'svelte/compiler';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const { framework } = JSON.parse(readFileSync('app.json', 'utf8'));
const ext = { react: 'tsx', vue: 'vue', svelte: 'svelte' }[framework] ?? 'ts';
mkdirSync('dist', { recursive: true });
const options = { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, skipLibCheck: true, jsx: 'react-jsx', experimentalDecorators: true, useDefineForClassFields: false, lib: ['ES2022', 'DOM'], types: ['svelte'], outDir: './compiled' };
writeFileSync('tsconfig.json', JSON.stringify({ compilerOptions: options, include: [`App.${ext}`], angularCompilerOptions: { compilationMode: 'full', strictTemplates: true } }));
const bin = framework === 'angular' ? resolve(require.resolve('@angular/compiler-cli/package.json'), '../bundles/src/bin/ngc.js') : framework === 'vue' ? require.resolve('vue-tsc/bin/vue-tsc.js') : framework === 'svelte' ? require.resolve('svelte-check/bin/svelte-check') : require.resolve('typescript/bin/tsc');
execFileSync(process.execPath, [bin, ...(framework === 'svelte' ? ['--tsconfig', './tsconfig.json'] : ['-p', 'tsconfig.json', ...(framework === 'angular' ? [] : ['--noEmit'])])], { stdio: 'inherit' });
const entries = {
  vanilla: `import { mount } from './App.ts'; const app = mount(host); window.trial = { update: (...args) => app.update(...args), unmount: () => app.destroy() };`,
  react: `import React from 'react'; import { createRoot } from 'react-dom/client'; import { App } from './App.tsx'; const root = createRoot(host); window.trial = { update: (enabled,destination) => root.render(React.createElement(App,{enabled,destination})), unmount: () => root.unmount() };`,
  vue: `import { createApp, h, reactive } from 'vue'; import App from './App.vue'; const props = reactive({enabled:true,destination:1}); const app = createApp({render:()=>h(App,props)}); app.mount(host); window.trial = { update: (enabled,destination) => Object.assign(props,{enabled,destination}), unmount: () => app.unmount() };`,
  svelte: `import { mount, unmount } from 'svelte'; import Wrapper from './Wrapper.svelte'; const app = mount(Wrapper,{target:host}); window.trial = {update:(...args)=>app.update(...args),unmount:()=>unmount(app)};`,
  angular: `import '@angular/compiler'; import { bootstrapApplication } from '@angular/platform-browser'; import { provideZonelessChangeDetection } from '@angular/core'; import { App } from './compiled/App.js'; host.innerHTML='<app-settings></app-settings>'; const app=await bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]}); const component=app.components[0]; window.trial={update(enabled,destination){component.setInput('enabled',enabled);component.setInput('destination',destination);app.tick();},unmount(){app.destroy();host.replaceChildren();}};`,
};
if (framework === 'svelte') writeFileSync('Wrapper.svelte', '<script>import App from "./App.svelte"; let enabled=$state(true),destination=$state(1); export function update(e,d){enabled=e;destination=d;}</script><App {enabled} {destination}/>');
const plugins = [{ name: 'sfc', setup(b) {
  b.onLoad({filter:/\.vue$/}, args => { const {descriptor}=parse(readFileSync(args.path,'utf8'),{filename:args.path});return {contents:compileScript(descriptor,{id:'trial',inlineTemplate:true}).content,loader:'ts'}; });
  b.onLoad({filter:/\.svelte$/}, args => ({contents:compile(readFileSync(args.path,'utf8'),{filename:args.path,generate:'client'}).js.code,loader:'js'}));
} }];
await build({ stdin: {contents:`import '@funsaized/stet/style.css'; const host=document.querySelector('#host');window.submits=0;host.addEventListener('submit',e=>{e.preventDefault();window.submits++});${entries[framework]} window.trial.update(true,1);`,resolveDir:resolve('.'),loader:'ts'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/app.js',plugins,jsx:'automatic',conditions:['browser'],define:{'process.env.NODE_ENV':'"development"',__VUE_OPTIONS_API__:'true',__VUE_PROD_DEVTOOLS__:'false',__VUE_PROD_HYDRATION_MISMATCH_DETAILS__:'true'} });
writeFileSync('dist/index.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Workspace settings</title><link rel="stylesheet" href="./app.css"><style>body{font:16px system-ui;margin:32px;max-width:760px}button,input{margin:8px;padding:8px}section{margin-top:60px}p{max-width:500px}</style><form id="host"></form><script type="module" src="./app.js"></script></html>');
console.log('Application compiler and browser bundle pass.');
