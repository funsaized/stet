import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  render,
  publicPages,
  pageComponents,
  canonical,
  ORIGIN,
  structuredData,
} from '../.ssr/entry-server.js';
const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(
  await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'),
);
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
for (const p of [
  ...publicPages,
  {
    path: '/404',
    title: 'Page not found — Stet',
    description: 'This page could not be found. Explore Stet documentation and live UI examples.',
    index: false,
  },
]) {
  const tags = [
    `<title>${escape(p.title)}</title>`,
    `<meta name="description" content="${escape(p.description)}">`,
    `<meta name="robots" content="${p.index ? 'index,follow' : 'noindex,follow'}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${escape(p.title)}">`,
    `<meta property="og:description" content="${escape(p.description)}">`,
    `<meta property="og:image" content="${ORIGIN}/social.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Stet: live UI annotations for agents and developers, with hand-drawn marks and a sticky note">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(p.title)}">`,
    `<meta name="twitter:description" content="${escape(p.description)}">`,
    `<meta name="twitter:image" content="${ORIGIN}/social.png">`,
    `<meta name="twitter:image:alt" content="Stet: live UI annotations for agents and developers, with hand-drawn marks and a sticky note">`,
  ];
  if (p.index)
    tags.push(
      `<link rel="canonical" href="${canonical(p.path)}">`,
      `<meta property="og:url" content="${canonical(p.path)}">`,
      `<script id="page-schema" type="application/ld+json">${JSON.stringify(structuredData(p)).replaceAll('<', '\\u003c')}</script>`,
    );
  const resources = new Set();
  const visit = (key) => {
    const chunk = manifest[key];
    if (!chunk || resources.has(chunk.file)) return;
    resources.add(chunk.file);
    for (const css of chunk.css ?? []) resources.add(css);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  };
  if (p.index) visit(`src/pages/${pageComponents[p.kind]}.tsx`);
  const bodyFont =
    manifest['node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2'].file;
  const links = [
    `<link rel="preload" href="/${bodyFont}" as="font" type="font/woff2" crossorigin>`,
  ];
  for (const file of resources) {
    if (file.endsWith('.css') && !template.includes(`/${file}`))
      links.push(`<link rel="stylesheet" href="/${file}">`);
    if (file.endsWith('.js') && !template.includes(`/${file}`))
      links.push(`<link rel="modulepreload" href="/${file}">`);
  }
  const html = template
    .replace('<!--page-head-->', tags.join('\n'))
    .replace('</head>', links.join('\n') + '\n</head>')
    .replace('<div id="root"></div>', `<div id="root">${await render(p.path)}</div>`);
  const file = p.path === '/' ? 'index.html' : `${p.path.slice(1)}.html`;
  const url = new URL(`../dist/${file}`, import.meta.url);
  await mkdir(new URL('.', url), { recursive: true });
  await writeFile(url, html);
}
await writeFile(
  new URL('../dist/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages
    .filter((p) => p.index && p.sitemap)
    .map((p) => `  <url><loc>${canonical(p.path)}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
await writeFile(
  new URL('../dist/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`,
);
console.log(`Prerendered ${publicPages.length} public pages and a noindex 404.`);
