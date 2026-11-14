// Frame-time sampling from the shell: opens Playwright's Chromium, optionally slows its CPU through the DevTools
// protocol (`Emulation.setCPUThrottlingRate`), pastes `frame-sampler.js` into the page and prints one JSON entry per
// CPU rate x target. See ../SKILL.md, "Frame time".
import { chromium, type CDPSession, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SAMPLER = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'frame-sampler.js'), 'utf8');

const { values } = parseArgs({
  options: {
    url: { type: 'string' },
    transition: { type: 'string', multiple: true, default: [] },
    ambient: { type: 'string', multiple: true, default: [] },
    cpu: { type: 'string', default: '1' },
    ms: { type: 'string', default: '3000' },
    width: { type: 'string', default: '1440' },
    height: { type: 'string', default: '900' },
    theme: { type: 'string', default: 'light' },
    headed: { type: 'boolean', default: false },
  },
});

if (!values.url || values.transition.length + values.ambient.length === 0) {
  console.error(
    'Usage: npm run frame-sample -- --url <url> (--transition <outgoing Slide id> | --ambient <Slide id>)… ' +
      '[--cpu 1,4] [--ms 3000] [--width 1440 --height 900] [--theme light|dark] [--headed]',
  );
  process.exit(2);
}

const targets = [
  ...values.transition.map((id) => ({ kind: 'transition', id })),
  ...values.ambient.map((id) => ({ kind: 'ambient', id })),
];

/** One CPU rate: every target sampled in turn, at that slowdown. */
async function sampleAt(page: Page, cdp: CDPSession, rate: number) {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const entries = [];
  for (const { kind, id } of targets) {
    const options = { ms: Number(values.ms), ...(kind === 'transition' && { transition: id }) };
    if (kind === 'ambient') await page.locator(`[id="${id}"]`).scrollIntoViewIfNeeded();
    const stats = await page.evaluate((sample) => globalThis.sampleFrames(sample), options);
    entries.push({ cpu: rate, kind, id, theme: values.theme, width: Number(values.width), ...stats });
  }
  return entries;
}

const browser = await chromium.launch({ channel: 'chromium', headless: !values.headed });
try {
  const context = await browser.newContext({
    viewport: { width: Number(values.width), height: Number(values.height) },
    colorScheme: values.theme === 'dark' ? 'dark' : 'light',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await page.goto(values.url, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: SAMPLER });
  const entries = [];
  for (const rate of values.cpu.split(',').map(Number)) entries.push(...(await sampleAt(page, cdp, rate)));
  console.log(JSON.stringify(entries, null, 2));
} finally {
  await browser.close();
}
