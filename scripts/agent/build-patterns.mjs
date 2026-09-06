import { build } from 'esbuild';
import { parse, compileScript } from '@vue/compiler-sfc';
import { compile } from 'svelte/compiler';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const out = resolve('test-results/patterns');
mkdirSync(out, { recursive: true });
const source = framework => resolve(`agent/templates/${framework}/lifecycle.${({ react: 'tsx', vue: 'vue', svelte: 'svelte' })[framework] ?? 'ts'}`);
const sfc = {
  name: 'canonical-components', setup(b) {
    b.onLoad({ filter: /\.vue$/ }, args => {
      const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
      return { contents: compileScript(descriptor, { id: 'stet-pattern', inlineTemplate: true }).content, loader: 'ts' };
    });
    b.onLoad({ filter: /\.svelte$/ }, args => ({ contents: compile(readFileSync(args.path, 'utf8'), { filename: args.path, generate: 'client' }).js.code, loader: 'js' }));
  },
};
writeFileSync(resolve(out, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler', experimentalDecorators: true, skipLibCheck: true, strict: true, outDir: './angular', paths: { '@funsaized/stet': [resolve('dist/index.d.ts')] } }, angularCompilerOptions: { compilationMode: 'full', strictTemplates: true }, files: [source('angular')] }));
execFileSync(process.execPath, [resolve('node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'), '-p', resolve(out, 'tsconfig.json')], { stdio: 'inherit' });
const entries = {
  vanilla: `import { annotate } from ${JSON.stringify(source('vanilla'))};
const target = document.createElement('button'); target.type = 'submit'; target.textContent = 'Review action'; host.append(target);
const marks = annotate(target); let to;
window.trial = { update(enabled, destination) { to?.remove(); to = null; if (destination) { to = document.createElement('p'); to.textContent = 'Consequences of this action'; host.append(to); } marks.update(enabled, to); }, unmount() { marks.destroy(); host.replaceChildren(); } };`,
  react: `import React from 'react'; import { createRoot } from 'react-dom/client'; import { AnnotatedAction } from ${JSON.stringify(source('react'))};
const root = createRoot(host); window.trial = { update(enabled, destination) { root.render(React.createElement(AnnotatedAction, {enabled, destination})); }, unmount() { root.unmount(); } };`,
  vue: `import { createApp, h, reactive } from 'vue'; import Component from ${JSON.stringify(source('vue'))};
const state = reactive({ enabled: true, destination: 0 }); const app = createApp({ render: () => h(Component, state) }); app.mount(host);
window.trial = { update(enabled, destination) { Object.assign(state, {enabled, destination}); }, unmount() { app.unmount(); } };`,
  svelte: `import { mount, unmount } from 'svelte'; import Component from ${JSON.stringify(source('svelte'))};
import { createRawSnippet } from 'svelte';
// A tiny compiled wrapper supplies reactive parent props to the canonical component.
import Wrapper from './wrapper.svelte';
const component = mount(Wrapper, { target: host }); window.trial = { update: (...args) => component.update(...args), unmount: () => unmount(component) };`,
  angular: `import '@angular/compiler'; import { bootstrapApplication } from '@angular/platform-browser'; import { provideZonelessChangeDetection } from '@angular/core'; import { AnnotatedAction } from './angular/lifecycle.js';
const element = document.createElement('app-annotated-action'); host.append(element);
const app = await bootstrapApplication(AnnotatedAction, { providers: [provideZonelessChangeDetection()] }); const component = app.components[0];
window.trial = { update(enabled, destination) { component.setInput('enabled', enabled); component.setInput('destination', destination); app.tick(); }, unmount() { app.destroy(); host.replaceChildren(); } };`,
};
writeFileSync(resolve(out, 'wrapper.svelte'), `<script>import Component from ${JSON.stringify(source('svelte'))}; let enabled = $state(true), destination = $state(0); export function update(e,d) { enabled=e; destination=d; }</script><Component {enabled} {destination}/>`);
for (const [framework, entry] of Object.entries(entries)) {
  const contents = `const host = document.querySelector('#host'); window.submits = 0; host.addEventListener('submit', event => { event.preventDefault(); window.submits++; });\n${entry}\nwindow.trial.update(true, 0);`;
  await build({ stdin: { contents, resolveDir: out, sourcefile: `${framework}.ts`, loader: 'ts' }, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', outfile: resolve(out, `${framework}.js`), plugins: [sfc], alias: { '@funsaized/stet/style.css': resolve('style.css'), '@funsaized/stet': resolve('dist/index.js') }, jsx: 'automatic', conditions: ['browser'], define: { 'process.env.NODE_ENV': '"development"', __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true' } });
  writeFileSync(resolve(out, `${framework}.html`), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Stet ${framework} lifecycle verification</title><link rel="stylesheet" href="/style.css"><style>body{font:16px system-ui;margin:40px;min-height:1600px}form{margin-top:120px;max-width:520px}button{padding:12px}p{margin-top:140px}</style><form id="host"></form><script type="module" src="./${framework}.js"></script></html>`);
}
console.log('Built five canonical lifecycle browser fixtures in test-results/patterns.');
