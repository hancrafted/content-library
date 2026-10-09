// One PNG per Slide of an Episode page, in one theme, for an agent to read.
//
//   npm run build
//   npm run screenshot -- /episode/page-template --theme dark [--base http://localhost:3000]
//
// Serves the built site in `out/` itself, on a free port, unless `--base` names a
// running one. Needs a browser once per machine: `npx playwright install chromium`.
// Output: .screenshots/<episode>/<theme>/<slide-id>.png, where <episode> is the
// path's last segment, suffixed with the locale (`page-template-de`) for a
// locale-prefixed path so the locales never overwrite each other.
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import nextConfig from '../next.config.ts';
import { PREFIXED_LOCALES } from '../src/lib/locale.pure.ts';

const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1280, height: 800 };
const SETTLE_MS = 400;
const OUT_DIR = path.resolve('out');
const BASE_PATH = nextConfig.basePath ?? '';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { theme: { type: 'string' }, base: { type: 'string' } },
});

const [pagePath] = positionals;
if (!pagePath?.startsWith('/') || !THEMES.includes(values.theme ?? ''))
  fail('Usage: npm run screenshot -- <path> --theme light|dark [--base <url>]');
if (!values.base && !existsSync(path.join(OUT_DIR, 'index.html')))
  fail('No built site in out/: run npm run build first.');
if (!existsSync(chromium.executablePath()))
  fail('No Chromium for Playwright: run npx playwright install chromium first.');

function fail(message) {
  console.error(message);
  process.exit(1);
}

/** `.screenshots/<episode>[-<locale>]/<theme>`. */
function outDirFor(segments) {
  const slug = segments.at(-1);
  const locale = PREFIXED_LOCALES.find((prefix) => prefix === segments[0]);
  return path.join('.screenshots', locale ? `${slug}-${locale}` : slug, values.theme);
}

/** The exported file a URL path names, as GitHub Pages resolves it: `/x/` is `x/index.html`. */
async function fileFor(urlPath) {
  const file = path.join(OUT_DIR, decodeURIComponent(urlPath));
  if (!file.startsWith(OUT_DIR)) return undefined;
  const found = await stat(file).catch(() => undefined);
  if (found?.isFile()) return file;
  if (found?.isDirectory() && existsSync(path.join(file, 'index.html'))) return path.join(file, 'index.html');
  return undefined;
}

/** Serves `out/` under the configured `basePath`; a directory without its trailing slash redirects, as on Pages. */
async function serveOut() {
  const server = createServer(async (request, response) => {
    const { pathname } = new URL(request.url ?? '/', 'http://localhost');
    const inside = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || '/' : undefined;
    const file = inside === undefined ? undefined : await fileFor(inside);
    if (file?.endsWith('index.html') && !inside.endsWith('/') && !inside.endsWith('.html')) {
      response.writeHead(301, { location: `${pathname}/` }).end();
      return;
    }
    const status = file ? 200 : 404;
    const body = await readFile(file ?? path.join(OUT_DIR, '404.html'));
    response.writeHead(status, { 'content-type': TYPES[path.extname(file ?? '.html')] ?? 'application/octet-stream' });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { server, base: `http://127.0.0.1:${server.address().port}${BASE_PATH}` };
}

const outDir = outDirFor(pagePath.split('/').filter(Boolean));
const served = values.base ? undefined : await serveOut();
const base = (values.base ?? served.base).replace(/\/$/, '');
const browser = await chromium.launch();
try {
  // A fresh context stores no theme, so the site follows the system (`system`, its default): `colorScheme` is that system.
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: 'reduce', colorScheme: values.theme });
  await page.goto(`${base}${pagePath}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    (dark) => document.documentElement.classList.contains('dark') === dark,
    values.theme === 'dark',
  );

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const ids = await page.locator('[data-slide]').evaluateAll((nodes) => nodes.map((node) => node.dataset.slide));
  for (const id of ids) {
    const slide = page.locator(`[data-slide="${id}"]`);
    await slide.evaluate((node) => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    // A far Slide is unmounted (FE-009); wait until scrolling has mounted its content.
    await slide.locator('[data-slot="slide-mount"]:not([data-zone="far"])').waitFor();
    await page.waitForTimeout(SETTLE_MS);
    await slide.screenshot({ path: path.join(outDir, `${id}.png`) });
  }
  console.log(`${ids.length} Slides -> ${outDir}`);
} finally {
  await browser.close();
  served?.server.close();
}
