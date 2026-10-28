import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The browser lane (`npm run test:browser`: pre-push when a push touches it, nightly on `main` in CI): a real
// subprocess and a real headless browser on local HTML files, so no network. Pins the page health inspect-page
// reports for a page an agent made: whether it scrolls sideways at the given width, and which images did not load.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SCRIPT = path.join(ROOT, 'skills/visual-check/scripts/inspect-page.ts');
const TIMEOUT = 120_000;
/** A one-pixel PNG, so an image loads without the network. */
const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

const folders: string[] = [];
test.afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

/** A page written to a fresh folder, as a file URL. */
function pageOf(body: string): string {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'inspect-page-'));
  folders.push(folder);
  const file = path.join(folder, 'page.html');
  writeFileSync(file, `<!doctype html><meta name="viewport" content="width=device-width"><body>${body}</body>`);
  return `file://${file}`;
}

/** What inspect-page reports for one URL at one width and theme. */
function inspect(url: string, width: string, theme: string): { health?: unknown } {
  const run = spawnSync('node', [SCRIPT, '--url', url, '--width', width, '--theme', theme, '--wait', '200'], {
    encoding: 'utf8',
  });
  const [entry] = JSON.parse(run.stdout) as { health?: unknown }[];
  return entry ?? {};
}

test.describe.configure({ timeout: TIMEOUT });

test.describe('success cases', () => {
  test('reports a page that fits the phone width and loads its images as healthy', () => {
    // ARRANGE
    const url = pageOf(`<img src="${PIXEL}" alt="" style="max-width:100%">`);
    const healthy = { overflowX: false, brokenImages: [] };
    // ACT
    const entry = inspect(url, '390', 'dark');
    // ASSERT
    expect(entry.health).toEqual(healthy);
  });
});

test.describe('failure cases', () => {
  test('reports a page wider than the phone and an image that did not load', () => {
    // ARRANGE
    const missing = 'missing.jpg';
    const url = pageOf(`<div style="width:900px">Wide</div><img src="${missing}" alt="">`);
    // ACT
    const entry = inspect(url, '390', 'dark');
    // ASSERT
    expect(entry.health).toMatchObject({ overflowX: true, brokenImages: [expect.stringContaining(missing)] });
  });
});

test.describe('edge cases', () => {
  test('reports the same wide page as fitting at the desktop width', () => {
    // ARRANGE
    const url = pageOf('<div style="width:900px">Wide</div>');
    const fits = { overflowX: false, brokenImages: [] };
    // ACT
    const entry = inspect(url, '1280', 'light');
    // ASSERT
    expect(entry.health).toEqual(fits);
  });
});
