import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const full = normalize(join(ROOT, decoded));
  return full.startsWith(ROOT) ? full : null;
}

const server = http.createServer(async (req, res) => {
  let urlPath = new URL(req.url, 'http://x').pathname;
  if (urlPath === '/') urlPath = '/index.html';
  let file = safePath(urlPath);
  if (!file) { res.writeHead(403); res.end('forbidden'); return; }
  try {
    const st = await stat(file);
    if (st.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 not found: ' + urlPath);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[serve] SMASHUP static server on http://127.0.0.1:${PORT} (root ${ROOT})`);
});

function close() { server.close(); }
export { server, close, PORT };

if (process.argv[1] && fileURLToPath(import.meta.url) === join(process.cwd(), 'tests', 'e2e', 'serve.mjs')) {
  server.on('error', (e) => { console.error('[serve] failed:', e.message); process.exit(1); });
}