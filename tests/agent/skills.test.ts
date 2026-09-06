// @vitest-environment node
import { expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
const root = resolve('agent/skills');
const names = readdirSync(root).sort();
function walk(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir,e.name)) : [join(dir,e.name)]); }
it('ships valid skill metadata and resolvable progressive references', () => {
  expect(names).toEqual(['stet', 'stet-explain-ui', 'stet-review-ui', 'stet-showcase-ui']);
  for (const name of names) {
    const text = readFileSync(join(root, name, 'SKILL.md'), 'utf8');
    const frontmatter = text.match(/^---\nname: ([\w-]+)\ndescription: ([^\n]+)\n---\n/);
    expect(frontmatter, name).not.toBeNull(); expect(frontmatter![1]).toBe(name); expect(frontmatter![2].length).toBeLessThanOrEqual(1024); expect(name.length).toBeLessThanOrEqual(64);
    expect(text.split('\n').length).toBeLessThan(150);
    expect(text).not.toMatch(/TODO|PLACEHOLDER|\[INSERT/);
  }
  for (const file of walk(root).filter(p => p.endsWith('.md'))) {
    const text = readFileSync(file,'utf8');
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const destination = resolve(dirname(file), match[1]); expect(destination.startsWith(root)).toBe(true); expect(existsSync(destination), `${file} → ${match[1]}`).toBe(true);
    }
    expect(text).not.toMatch(/from ["']stet(?:\/|["'])/);
  }
});
it('has positive and negative fixtures for every skill, with one initial route', () => {
  const routing = JSON.parse(readFileSync('agent/evals/routing.json', 'utf8'));
  expect(new Set(routing.map((r: any) => r.query)).size).toBe(routing.length);
  for (const name of names) {
    const cases = JSON.parse(readFileSync(join(root,name,'evals/trigger_evals.json'),'utf8'));
    expect(cases.some((c: any) => c.should_trigger)).toBe(true); expect(cases.some((c: any) => !c.should_trigger)).toBe(true);
    for (const route of routing) expect(cases.find((c: any) => c.query === route.query)?.should_trigger).toBe(route.expected === name);
  }
  expect(routing.some((r: any) => r.expected === 'none')).toBe(true);
});
it('every advertised primitive/framework has a canonical asset', () => {
  const caps = JSON.parse(readFileSync('agent/capabilities.json','utf8'));
  for (const framework of Object.keys(caps.frameworks)) for (const primitive of Object.keys(caps.primitives)) {
    const dir = `agent/templates/${framework}`;
    expect(readdirSync(dir).some(p => p.startsWith(primitive + '.'))).toBe(true);
  }
});
