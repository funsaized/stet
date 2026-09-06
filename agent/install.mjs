import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync, rmdirSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostname } from 'node:os';
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
const digest = path => { checkPath(path); const s = stat(path); if (!s) return null; if (!s.isFile()) throw new Failure('LOCAL_CHANGES', 'Expected a regular managed file.', 4, path); return hash(readFileSync(path)); };
const validName = p => typeof p === 'string' && /^stet(?:-[a-z]+)*(?:\/[A-Za-z0-9_.-]+)+$/.test(p) && !p.split('/').some(x => x === '.' || x === '..');
const validManifest = (m, pkg) => m?.package === pkg.name && m.format === 1 && m.files && typeof m.files === 'object' && !Array.isArray(m.files) && Object.entries(m.files).every(([p,h]) => validName(p) && /^[a-f0-9]{64}$/.test(h));

// PID liveness is only used conservatively: a live/reused PID is never reclaimed.
// A dead local process plus an unchanged random ownership token permits recovery.
function acquire(destination) {
  const lock = join(destination, '.stet-lock'), ownerPath = join(lock, 'owner.json');
  checkPath(lock); checkPath(ownerPath);
  try { mkdirSync(lock); } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    let owner, original;
    try { original = readFileSync(ownerPath, 'utf8'); owner = JSON.parse(original); } catch {}
    if (!owner || owner.host !== hostname() || !Number.isSafeInteger(owner.pid) || owner.pid < 1 || !/^[a-f0-9-]{36}$/.test(owner.token)) throw new Failure('INSTALL_LOCKED', 'Lock ownership is unknown. Preserve .stet-lock and verify no installer is active before reconciling it.', 4, lock);
    try { process.kill(owner.pid, 0); throw new Failure('INSTALL_LOCKED', `Installer process ${owner.pid} is active or its PID was reused; retry after it exits.`, 4, lock); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
    if (readFileSync(ownerPath, 'utf8') !== original) throw new Failure('INSTALL_LOCKED', 'Lock ownership changed; retry.', 4, lock);
    unlinkSync(ownerPath);
    try { rmdirSync(lock); mkdirSync(lock); } catch { throw new Failure('INSTALL_LOCKED', 'Another installer acquired the lock; retry.', 4, lock); }
  }
  const owner = JSON.stringify({ host: hostname(), pid: process.pid, token: randomUUID() });
  writeFileSync(ownerPath, owner, { flag: 'wx' });
  return () => { if (readFileSync(ownerPath, 'utf8') === owner) { unlinkSync(ownerPath); rmdirSync(lock); } };
}

export function installSkills(action, tool, cwd, checkpoint = () => {}) {
  if (!Object.hasOwn(tools, tool)) throw new Failure('INVALID_TOOL', `Choose tool: ${Object.keys(tools).join(', ')}.`, 2);
  const destination = resolve(cwd, tools[tool]);
  checkPath(destination);
  mkdirSync(destination, { recursive: true });
  const release = acquire(destination);
  try { return installLocked(action, tool, cwd, destination, checkpoint); } finally { release(); }
}
function installLocked(action, tool, cwd, destination, checkpoint) {
  const source = fileURLToPath(new URL('./skills/', import.meta.url));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const marker = join(destination, '.stet-managed.json');
  const journalPath = join(destination, '.stet-journal.json');
  checkPath(marker); checkPath(journalPath);
  let recovered = false;
  function apply(journal) {
    const entries = [...journal.changes, { name: '.stet-managed.json', before: journal.before, content: journal.manifest }];
    // Preflight all recovery writes, including edits made after the interruption.
    for (const entry of entries) {
      const current = digest(join(destination, entry.name));
      if (current !== entry.before && current !== hash(entry.content)) throw new Failure('RECOVERY_CONFLICT', `Preserving ${entry.name}: content changed since preparation. Reconcile with .stet-journal.json and retry.`, 4, entry.name);
    }
    for (const entry of entries) {
      const path = join(destination, entry.name), next = hash(entry.content);
      if (digest(path) === next) continue;
      mkdirSync(dirname(path), { recursive: true });
      const temp = `${path}.stet-${journal.token}.tmp`;
      checkPath(temp);
      if (stat(temp)) {
        if (digest(temp) !== next) throw new Failure('RECOVERY_CONFLICT', 'Owned staging file was edited; preserve and reconcile it.', 4, temp);
      } else writeFileSync(temp, entry.content, { flag: 'wx' });
      checkpoint('staged', entry.name);
      if (digest(path) !== entry.before) throw new Failure('RECOVERY_CONFLICT', 'Destination changed during installation; retry after reconciling local edits.', 4, path);
      renameSync(temp, path);
      checkpoint(entry.name === '.stet-managed.json' ? 'committed' : 'written', entry.name);
    }
    unlinkSync(journalPath);
  }
  if (stat(journalPath)) {
    let journal;
    try {
      journal = JSON.parse(readFileSync(journalPath, 'utf8'));
      if (journal.format !== 1 || !/^[a-f0-9-]{36}$/.test(journal.token) || !(journal.before === null || /^[a-f0-9]{64}$/.test(journal.before)) || typeof journal.manifest !== 'string' || !validManifest(JSON.parse(journal.manifest), pkg) || !Array.isArray(journal.changes)) throw new Error();
      const names = new Set();
      for (const c of journal.changes) {
        if (!validName(c.name) || names.has(c.name) || typeof c.content !== 'string' || !(c.before === null || /^[a-f0-9]{64}$/.test(c.before)) || JSON.parse(journal.manifest).files[c.name] !== hash(c.content)) throw new Error();
        names.add(c.name);
      }
    } catch { throw new Failure('INVALID_RECOVERY', 'Recovery journal is malformed; preserve it and local files before reconciling.', 4, journalPath); }
    apply(journal); recovered = true;
  }
  let previous = { files: {} };
  if (stat(marker)) {
    try { previous = JSON.parse(readFileSync(marker, 'utf8')); if (!validManifest(previous, pkg)) throw new Error(); }
    catch { throw new Failure('INVALID_MANIFEST', 'Managed skill manifest is invalid. Preserve local files and resolve the manifest before retrying.', 4, marker); }
  } else if (action === 'update') throw new Failure('NOT_INITIALIZED', 'Run stet agent init for this tool before update.', 4, marker);
  const incoming = Object.fromEntries(files(source).map(p => [p.split(sep).join('/'), readFileSync(join(source, p), 'utf8')]));
  const changes = [], conflicts = [];
  for (const [name, content] of Object.entries(incoming)) {
    const path = join(destination, name), current = digest(path);
    if (current === hash(content)) continue;
    if (current && (action !== 'update' || previous.files[name] !== current) || !current && previous.files[name] && action === 'update') { conflicts.push(name); continue; }
    changes.push({ name, content, before: current });
  }
  if (conflicts.length) throw new Failure('LOCAL_CHANGES', `Preserving conflicting files: ${conflicts.join(', ')}. Move or reconcile them, then retry; update only replaces unchanged managed files.`, 4, tools[tool]);
  const manifest = JSON.stringify({ format: 1, package: pkg.name, version: pkg.version, files: { ...previous.files, ...Object.fromEntries(Object.entries(incoming).map(([p,c]) => [p, hash(c)])) } }, null, 2) + '\n';
  if (changes.length || digest(marker) !== hash(manifest)) {
    const journal = { format: 1, token: randomUUID(), before: digest(marker), manifest, changes };
    // Exclusive journal creation is the preparation boundary. A torn journal is
    // a precise conflict, never grounds for overwriting application files.
    writeFileSync(journalPath, JSON.stringify(journal), { flag: 'wx' });
    checkpoint('prepared');
    apply(journal);
  }
  return { ok: true, recovered, tool, directory: relative(resolve(cwd), destination).split(sep).join('/'), version: pkg.version, changed: changes.map(c => c.name), skills: readdirSync(source).sort() };
}
