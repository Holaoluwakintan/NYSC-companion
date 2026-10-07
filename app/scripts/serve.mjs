// Local stand-in for Vercel: serves dist/ (SPA), /api/*.js functions, and the /c/:code rewrite. Usage: node scripts/serve.mjs [port]
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist'); const api = join(root, '../api');
const port = +(process.argv[2] || 4173);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
function shim(res) {
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  res.send = b => { res.end(b); return res; };
  return res;
}
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  let path = u.pathname;
  const m = /^\/c\/([A-Za-z]{2})$/.exec(path); if (m) { path = '/api/card'; u.searchParams.set('code', m[1]); }
  if (path.startsWith('/api/')) {
    const f = join(api, path.slice(5).replace(/[^a-z-]/g, '') + '.js');
    if (!existsSync(f)) { res.statusCode = 404; return res.end('no fn'); }
    let body = ''; for await (const ch of req) body += ch;
    req.query = Object.fromEntries(u.searchParams); try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = body; }
    try { await require(f)(req, shim(res)); } catch (e) { res.statusCode = 500; res.end(String(e)); }
    return;
  }
  let file = join(dist, decodeURIComponent(path));
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
  res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(port, () => console.log('serving on ' + port));
