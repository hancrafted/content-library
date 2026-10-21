// `npm run design-archive [-- <port>]`: serves `design-archive/` on localhost (default 4400) and opens its index, so
// the Design archive (GLOSSARY.md) is browsed over http. Local only; the archive is never deployed.

import { execFile } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve('design-archive');
const PORT = Number(process.argv[2] ?? 4400);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

if (!existsSync(path.join(ROOT, 'index.html'))) {
  console.error('✖ design-archive/index.html is missing; run this from the repo root after `npm run episode:archive`.');
  process.exit(1);
}

/** The file a request path names inside the archive, a folder resolved to its `index.html`; none outside it. */
function archiveFile(url: string | undefined): string | undefined {
  const file = path.join(ROOT, decodeURIComponent(new URL(url ?? '/', 'http://localhost').pathname));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return undefined;
  return existsSync(file) && statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
}

createServer((request, response) => {
  const file = archiveFile(request.url);
  if (file === undefined) {
    response.writeHead(403).end();
    return;
  }
  if (!existsSync(file)) {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
}).listen(PORT, '127.0.0.1', () => {
  const address = `http://localhost:${PORT}/`;
  console.log(`Design archive: ${address}  (Ctrl+C stops it)`);
  execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [address], () => undefined);
});
