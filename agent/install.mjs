import { createHash } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tools } from './catalog.mjs';
export class Failure extends Error {
  constructor(code, message, exitCode, path = '$') { super(message); Object.assign(this, { code, exitCode, path }); }
}
const hash = data => createHash('sha256').update(data).digest('hex');
const stat = path => { try { return lstatSync(path); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
function checkPath(path) {
  const parent = dirname(path);
  if (parent !== path) checkPath(parent);
  const s = stat(path);
  if (s?.isSymbolicLink()) throw new Failure('SYMLINK_CONFLICT', 'Skill installation does not follow symlinks. Choose a real project directory.', 4, path);
}
function files(root, prefix = '') {
  return readdirSync(root, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name, 'en')).flatMap(entry => {
    const path = join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Failure('SYMLINK_CONFLICT', 'Unexpected symlink in skill assets.', 4, path);
    return entry.isDirectory() ? files(join(root, entry.name), path) : [path];
  });
}
export function installSkills(action, tool, cwd) {
  if (!Object.hasOwn(tools, tool)) throw new Failure('INVALID_TOOL', `Choose tool: ${Object.keys(tools).join(', ')}.`, 2);
  const destination = resolve(cwd, tools[tool]);
  checkPath(destination);
  const source = fileURLToPath(new URL('./skills/', import.meta.url));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const marker = join(destination, '.stet-managed.json');
  checkPath(marker);
  let previous = { files: {} };
  if (stat(marker)) {
    try {
      previous = JSON.parse(readFileSync(marker, 'utf8'));
      if (previous.package !== pkg.name || previous.format !== 1 || !previous.files || typeof previous.files !== 'object' || Array.isArray(previous.files) || !Object.entries(previous.files).every(([p,h]) => p.startsWith('stet') && !p.split(/[\\/]/).includes('..') && /^[a-f0-9]{64}$/.test(h))) throw new Error();
    } catch { throw new Failure('INVALID_MANIFEST', 'Managed skill manifest is invalid. Preserve local files and resolve the manifest before retrying.', 4, marker); }
  } else if (action === 'update') throw new Failure('NOT_INITIALIZED', 'Run stet agent init for this tool before update.', 4, marker);
  const incoming = Object.fromEntries(files(source).map(p => [p.split(sep).join('/'), readFileSync(join(source, p))]));
  const changes = [], conflicts = [];
  // Preflight the complete write set before changing any file.
  for (const [name, content] of Object.entries(incoming)) {
    const path = join(destination, name);
    checkPath(path);
    const s = stat(path);
    if (s && !s.isFile()) { conflicts.push(name); continue; }
    const current = s ? readFileSync(path) : null;
    if (current && hash(current) === hash(content)) continue;
    if (current && (action !== 'update' || previous.files[name] !== hash(current))) { conflicts.push(name); continue; }
    // A removed managed file is a local edit, too.
    if (!current && previous.files[name] && action === 'update') { conflicts.push(name); continue; }
    changes.push({ name, content });
  }
  // Preserve obsolete assets (and ownership hashes) rather than deleting local files.
  if (conflicts.length) throw new Failure('LOCAL_CHANGES', `Preserving conflicting files: ${conflicts.join(', ')}. Move or reconcile them, then retry; update only replaces unchanged managed files.`, 4, tools[tool]);
  mkdirSync(destination, { recursive: true });
  for (const { name, content } of changes) {
    const path = join(destination, name);
    mkdirSync(dirname(path), { recursive: true });
    // Exclusive temp creation and atomic rename avoid truncated individual files.
    const temp = `${path}.stet-tmp`;
    try { writeFileSync(temp, content, { flag: 'wx' }); renameSync(temp, path); }
    catch (e) { if (e.code !== 'EEXIST') { try { unlinkSync(temp); } catch {} } throw e; }
  }
  const manifest = { format: 1, package: pkg.name, version: pkg.version, files: { ...previous.files, ...Object.fromEntries(Object.entries(incoming).map(([p,c]) => [p, hash(c)])) } };
  const text = JSON.stringify(manifest, null, 2) + '\n';
  if (!stat(marker) || readFileSync(marker, 'utf8') !== text) {
    const temp = `${marker}.stet-tmp`;
    writeFileSync(temp, text, { flag: 'wx' });
    renameSync(temp, marker);
  }
  return { ok: true, tool, directory: relative(resolve(cwd), destination).split(sep).join('/'), version: pkg.version, changed: changes.map(c => c.name), skills: readdirSync(source).sort() };
}
