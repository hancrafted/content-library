// Serves the static export (`out/`) on a fixed port with Node's own HTTP server,
// so a visual check never needs `npx serve`, `sleep` or `pkill`. See ../SKILL.md.
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const PORT = Number(process.env.PREVIEW_PORT ?? 4300);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const outDir = path.join(root, 'out');
if (!existsSync(outDir)) {
  console.error('✖ no out/ yet; run `npm run build` first');
  process.exit(1);
}

/** `trailingSlash: true` exports every page as `<route>/index.html`. */
function resolveFile(urlPath: string): string | undefined {
  const candidate = path.join(outDir, decodeURIComponent(urlPath));
  if (!candidate.startsWith(outDir)) return undefined;
  const file =
    existsSync(candidate) && statSync(candidate).isDirectory() ? path.join(candidate, 'index.html') : candidate;
  return existsSync(file) ? file : undefined;
}

createServer((request, response) => {
  const file = resolveFile(new URL(request.url ?? '/', 'http://localhost').pathname);
  const served = file ?? path.join(outDir, '404.html');
  response.writeHead(file ? 200 : 404, { 'content-type': TYPES[path.extname(served)] ?? 'application/octet-stream' });
  createReadStream(served).pipe(response);
}).listen(PORT, () => console.log(`✔ serving ${outDir} at http://localhost:${PORT}/`));
