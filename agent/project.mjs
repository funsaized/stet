import { lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { Failure } from './install.mjs';

const frameworkPackages = { react: 'react', vue: 'vue', svelte: 'svelte', '@angular/core': 'angular' };
const limits = { depth: 4, directories: 120, files: 240, bytesPerFile: 262144 };
const stat = path => { try { return lstatSync(path); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
export function inspectProject(directory) {
  const root = resolve(directory);
  if (!stat(root)?.isDirectory()) throw new Failure('PROJECT_DIRECTORY', 'Choose an existing real application directory.', 3, root);
  const paths = [], errors = [], evidence = [], packages = [];
  let directories = 0, examined = 0, truncated = false;
  const display = path => relative(root, path).split(sep).join('/') || '.';
  const read = path => {
    if (++examined > limits.files || stat(path)?.size > limits.bytesPerFile) { truncated = true; return null; }
    try { return readFileSync(path, 'utf8'); } catch (e) { errors.push({ path: display(path), code: 'PROJECT_READ', message: `Cannot read evidence (${e.code}).` }); return null; }
  };
  function walk(dir, depth) {
    if (++directories > limits.directories) { truncated = true; return; }
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name, 'en')); }
    catch (e) { errors.push({ path: display(dir), code: 'PROJECT_READ', message: `Cannot list directory (${e.code}).` }); return; }
    for (const e of entries) {
      if (e.name.startsWith('.') || ['node_modules', 'dist', 'build', 'coverage', 'test-results', 'vendor'].includes(e.name) || e.isSymbolicLink()) continue;
      const path = join(dir, e.name);
      if (e.isDirectory()) { if (depth < limits.depth) walk(path, depth + 1); else truncated = true; }
      else if (e.isFile() && (e.name === 'package.json' || /\.(?:[cm]?[jt]sx?|vue|svelte|html)$/.test(e.name))) {
        if (paths.length >= limits.files) { truncated = true; continue; }
        paths.push(path);
      }
    }
  }
  walk(root, 0);
  function installed(dir) {
    // Bounded ancestor lookup for npm-compatible hoisted installations. Never run a binary.
    for (let i = 0; i < 32; i++) {
      const path = join(dir, 'node_modules/@funsaized/stet/package.json');
      if (stat(path)) {
        try {
          const text = read(path); if (text === null) return null;
          const pkg = JSON.parse(text), packageRoot = dirname(realpathSync(path));
          if (pkg.name !== '@funsaized/stet' || typeof pkg.version !== 'string') throw new Error();
          const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.stet;
          const binary = typeof bin === 'string' ? resolve(packageRoot, bin) : null;
          return { version: pkg.version, package: packageRoot, binary: binary && binary.startsWith(packageRoot + sep) && stat(binary)?.isFile() ? binary : null };
        } catch { errors.push({ path: display(path), code: 'INSTALLED_MANIFEST', message: 'Installed Stet manifest is malformed; verify the local installation.' }); return null; }
      }
      const parent = dirname(dir); if (parent === dir) break; dir = parent;
    }
    return null;
  }
  for (const path of paths.sort()) {
    const text = read(path); if (text === null) continue;
    if (path.endsWith(`${sep}package.json`)) {
      try {
        const pkg = JSON.parse(text);
        if (!pkg || typeof pkg !== 'object' || Array.isArray(pkg)) throw new Error();
        for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'scripts']) if (pkg[field] !== undefined && (!pkg[field] || typeof pkg[field] !== 'object' || Array.isArray(pkg[field]) || Object.values(pkg[field]).some(v => typeof v !== 'string'))) throw new Error();
        const deps = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
        const candidates = Object.keys(frameworkPackages).filter(name => Object.hasOwn(deps, name)).map(name => frameworkPackages[name]).sort();
        for (const name of Object.keys(frameworkPackages)) if (Object.hasOwn(deps, name)) evidence.push({ framework: frameworkPackages[name], path: display(path), kind: 'declared-dependency', detail: `${name}: ${deps[name]}` });
        packages.push({ path: display(path), frameworks: candidates, declaredStet: deps['@funsaized/stet'] ?? null, installed: installed(dirname(path)), checks: Object.fromEntries(Object.entries(pkg.scripts ?? {}).filter(([name]) => /^(?:check|typecheck|test|build|lint)(?::|$)/.test(name)).sort(([a],[b]) => a.localeCompare(b, 'en'))) });
      } catch { errors.push({ path: display(path), code: 'PROJECT_MANIFEST', message: 'Fix malformed package.json before relying on its dependency/script evidence.' }); }
    } else {
      const framework = path.endsWith('.vue') ? 'vue' : path.endsWith('.svelte') ? 'svelte' : null;
      if (framework) evidence.push({ framework, path: display(path), kind: 'source-extension', detail: framework });
      for (const [name, framework] of Object.entries(frameworkPackages)) if (new RegExp(`(?:from\\s*|import\\s*)["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:["'/])`).test(text)) evidence.push({ framework, path: display(path), kind: 'source-import', detail: name });
    }
  }
  const candidates = [...new Set(evidence.map(e => e.framework))].sort();
  if (!candidates.length && paths.some(path => /\.(?:html|[cm]?[jt]s)$/.test(path))) { candidates.push('vanilla'); evidence.push({ framework: 'vanilla', path: display(paths.find(path => /\.(?:html|[cm]?[jt]s)$/.test(path))), kind: 'fallback', detail: 'Web source found without recognized framework evidence; verify source before selection.' }); }
  return { directory: root, candidates, ambiguous: candidates.length > 1 || packages.filter(p => p.frameworks.length).length > 1, packages, installed: installed(root), evidence: evidence.sort((a,b) => a.path.localeCompare(b.path, 'en') || a.framework.localeCompare(b.framework, 'en') || a.kind.localeCompare(b.kind, 'en')), errors, truncated, limits };
}
