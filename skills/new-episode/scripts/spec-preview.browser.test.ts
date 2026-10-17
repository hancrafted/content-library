import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// The browser lane (`npm run test:browser`, local only): a real subprocess and a real headless browser, against
// ARCH-003 §1.1. What the command reports is unit-tested in `spec-preview.pure.test.ts`; this smoke case proves the
// real render: every Option gets a screenshot, and text running past its Option is measured at 1440px.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SCRIPT = path.join(ROOT, 'skills/new-episode/scripts/spec-preview.ts');
const TIMEOUT = 120_000;

const option = (id: string, body: string) => `
<figure data-spec="option" data-option="${id}"${id.endsWith('a') ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4">${body}</div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>
</figure>`;

const folders: string[] = [];
afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

describe('browser smoke', () => {
  it(
    'renders every Option and measures text running past its Option at 1440px',
    () => {
      // ARRANGE
      const wide =
        '<p class="w-24 whitespace-nowrap">A very long line of text that cannot fit the box it sits in at all, however wide the page is, and keeps going past the Spec page edge too.</p>';
      const folder = mkdtempSync(path.join(os.tmpdir(), 'spec-preview-'));
      folders.push(folder);
      const fragment = path.join(folder, 'why.html');
      writeFileSync(
        fragment,
        `<!-- slide: spent -->${option('1a', wide)}${option('1b', '<p class="text-body">A mock.</p>')}`,
      );
      const expectedViolations = ['✖ Option 1a of {#spent} has text running past its box at 1440px'];
      const expectedShots = 2;
      // ACT
      const run = spawnSync('node', [SCRIPT, fragment], { cwd: ROOT, encoding: 'utf8', timeout: TIMEOUT });
      const lines = run.stdout.split('\n').filter(Boolean);
      const violations = lines.filter((line) => line.startsWith('✖')).map((line) => line.split(' (')[0]);
      const shots = lines.filter((line) => line.startsWith('screenshot ')).map((line) => line.split(' ').at(-1) ?? '');
      // ASSERT
      expect(violations).toEqual(expectedViolations);
      expect(shots).toHaveLength(expectedShots);
      for (const shot of shots) expect(existsSync(shot)).toBe(true);
    },
    TIMEOUT,
  );
});
