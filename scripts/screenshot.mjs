// One PNG per Slide of an Episode page, in one theme, for an agent to read.
//
//   npm run screenshot -- /episode/page-template --theme dark [--base http://localhost:3000]
//
// Needs a running server (`npm run dev`) and a browser (`npx playwright install chromium`).
// Output: .screenshots/<episode>/<theme>/<slide-id>.png, where <episode> is the
// path's last segment, suffixed with the locale (`page-template-de`) for a
// `/de/...` path so the two locales never overwrite each other.
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const THEMES = ['light', 'dark'];
const VIEWPORT = { width: 1280, height: 800 };
const SETTLE_MS = 400;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    theme: { type: 'string' },
    base: { type: 'string', default: 'http://localhost:3000' },
  },
});

const [pagePath] = positionals;
if (!pagePath?.startsWith('/') || !THEMES.includes(values.theme ?? '')) {
  console.error('Usage: npm run screenshot -- <path> --theme light|dark [--base <url>]');
  process.exit(1);
}

const segments = pagePath.split('/').filter(Boolean);
const slug = segments.at(-1);
const folder = segments[0] === 'de' ? `${slug}-de` : slug;
const outDir = path.join('.screenshots', folder, values.theme);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: VIEWPORT, reducedMotion: 'reduce' });
  await page.goto(new URL(pagePath, values.base).href, { waitUntil: 'networkidle' });

  // The real theme toggle, as a reader would use it; it persists the choice and sets the `dark` class.
  await page.getByTestId(`theme-${values.theme}`).first().click();
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
}
