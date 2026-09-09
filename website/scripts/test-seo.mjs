import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { publicPages, canonical, ORIGIN } from '../.ssr/entry-server.js';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const social = await readFile('dist/social.png');
assert.equal(social.readUInt32BE(16), 1200);
assert.equal(social.readUInt32BE(20), 630);
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.deepEqual(
  urls.sort(),
  publicPages
    .filter((p) => p.index && p.sitemap)
    .map((p) => canonical(p.path))
    .sort(),
);
assert.equal(new Set(urls).size, urls.length);
const graph = new Map();
const headings = new Set();
const titles = new Set(),
  descriptions = new Set();
for (const p of publicPages) {
  const window = new Window();
  const doc = window.document;
  doc.write(await readFile(`dist/${p.path === '/' ? 'index' : p.path.slice(1)}.html`, 'utf8'));
  assert.equal(doc.title, p.title);
  assert(!titles.has(doc.title));
  titles.add(doc.title);
  const meta = (key, attr = 'name') =>
    doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content');
  assert.equal(meta('description'), p.description);
  assert(!descriptions.has(p.description));
  descriptions.add(p.description);
  assert.equal(doc.querySelector('link[rel=canonical]')?.getAttribute('href'), canonical(p.path));
  assert(!meta('robots').includes('noindex'));
  assert.equal(doc.querySelectorAll('h1').length, 1, p.path);
  const heading = doc.querySelector('h1').textContent;
  assert(!headings.has(heading), `Duplicate H1: ${p.path}`);
  headings.add(heading);
  graph.set(p.path, []);
  assert(doc.querySelector('main').textContent.trim().length > 300, p.path);
  for (const prefix of ['og', 'twitter']) {
    const attr = prefix === 'og' ? 'property' : 'name';
    assert.equal(meta(`${prefix}:title`, attr), p.title);
    assert.equal(meta(`${prefix}:description`, attr), p.description);
    assert.equal(meta(`${prefix}:image`, attr), `${ORIGIN}/social.png`);
  }
  assert.equal(meta('og:url', 'property'), canonical(p.path));
  const schema = JSON.parse(doc.querySelector('#page-schema').textContent);
  assert.equal(schema['@context'], 'https://schema.org');
  if (p.path === '/') {
    const app = schema['@graph'].find((s) => s['@type'] === 'SoftwareApplication');
    assert.equal(app.url, canonical('/'));
    assert.equal(app.offers.price, '0');
    assert(app.license);
    assert(schema['@graph'].some((s) => s['@type'] === 'WebSite'));
  } else {
    assert.equal(schema['@type'], 'BreadcrumbList');
    schema.itemListElement.forEach((item, i) => {
      assert.equal(item.position, i + 1);
      assert(urls.includes(item.item));
      assert(item.name);
    });
    assert.equal(schema.itemListElement.at(-1).item, canonical(p.path));
  }
  for (const a of doc.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//')) {
      graph.get(p.path).push(href.split('#')[0]);
      assert(
        publicPages.some((x) => x.path === href.split('#')[0]),
        `${p.path}: broken internal link ${href}`,
      );
    }
  }
  await window.happyDOM.close();
}
const reachable = new Set();
const visit = (path) => {
  if (reachable.has(path)) return;
  reachable.add(path);
  for (const link of graph.get(path) ?? []) visit(link);
};
visit('/');
assert.deepEqual(
  [...reachable].sort(),
  publicPages.map((p) => p.path).sort(),
  'Every public page must be reachable from the homepage',
);
assert((await readFile('dist/404.html', 'utf8')).includes('noindex,follow'));
assert((await readFile('dist/robots.txt', 'utf8')).includes(`${ORIGIN}/sitemap.xml`));
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert(!config.rewrites);
assert.equal(config.cleanUrls, true);
assert.equal(config.trailingSlash, false);
assert.equal(config.redirects[0].destination, `${ORIGIN}/:path*`);
const pkg = JSON.parse(await readFile('../package.json', 'utf8'));
assert.equal(pkg.homepage, ORIGIN);
assert(!/https:\/\/stetkit\.com(?:[/\s)]|$)/.test(await readFile('../README.md', 'utf8')));
console.log(
  `SEO integrity: ${publicPages.length} static routes, unique metadata, schema, sitemap and canonical configuration passed.`,
);
