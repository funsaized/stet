// Production-style static preview: clean URLs, no SPA fallback, genuine 404.
import { gzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const args = process.argv.slice(2);
const port = Number(args[args.indexOf('--port') + 1]) || 4175;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
createServer(async (req, res) => {
  const send = (status, body, type) => {
    const compress =
      /\bgzip\b/.test(req.headers['accept-encoding'] ?? '') && /text|javascript|xml/.test(type);
    const data = compress ? gzipSync(body) : body;
    res
      .writeHead(status, {
        'Content-Type': type,
        'Content-Length': data.length,
        Vary: 'Accept-Encoding',
        ...(compress ? { 'Content-Encoding': 'gzip' } : {}),
      })
      .end(data);
  };
  const url = new URL(req.url, 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (path === '/index' || (path.endsWith('/') && path !== '/') || path.endsWith('.html')) {
    let destination = path.replace(/\.html$/, '').replace(/\/$/, '');
    if (destination === '/index') destination = '/';
    res.writeHead(308, { Location: (destination || '/') + url.search }).end();
    return;
  }
  const file = resolve(
    root,
    '.' + (path === '/' ? '/index.html' : extname(path) ? path : path + '.html'),
  );
  if (!file.startsWith(root + '/')) {
    res.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(file);
    send(200, body, types[extname(file)] || 'application/octet-stream');
  } catch {
    send(404, await readFile(resolve(root, '404.html')), 'text/html; charset=utf-8');
  }
}).listen(port, '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${port}`));
