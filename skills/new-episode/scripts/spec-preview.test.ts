import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// A real subprocess and a real headless browser, against ARCH-003 §1.1: the ticket (#222) asks for the command's
// exit code, printed violations and screenshots end to end, as the Spec server test does for its socket.
/*
 * `npm run episode:spec-preview` against fixture fragments in a temp folder: a clean fragment renders and exits 0
 * with its screenshot path, a dirty one still renders and exits 1 with one line per violation, and text running
 * past its Option's box is measured at 1440px and reported.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SCRIPT = path.join(ROOT, 'skills/new-episode/scripts/spec-preview.ts');
const TIMEOUT = 120_000;

const option = (id: string, body = '<p class="text-body">A mock.</p>', extra = '') => `
<figure data-spec="option" data-option="${id}"${id.endsWith('a') ? ' data-recommended' : ''}>
  <div data-spec="mock" class="bg-card p-4">${body}</div>
  <figcaption><b>${id}</b> A reason. Build cost: Scene.</figcaption>
  <div data-spec="build-notes"${extra}>Parts, tokens, props, i18n keys.</div>
</figure>`;

const folders: string[] = [];
afterEach(() => {
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

/** Runs the command on a fragment file holding `html`. */
function preview(html: string) {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'spec-preview-'));
  folders.push(folder);
  const fragment = path.join(folder, 'why.html');
  writeFileSync(fragment, html);
  const run = spawnSync('node', [SCRIPT, fragment], { cwd: ROOT, encoding: 'utf8', timeout: TIMEOUT });
  return { run, folder, lines: run.stdout.split('\n').filter(Boolean) };
}

describe('success cases', () => {
  it(
    'exits 0 and prints a screenshot path per Option for a clean fragment',
    () => {
      // ARRANGE
      const html = `<!-- slide: spent -->${option('1a')}${option('1b')}`;
      // ACT
      const { run, lines } = preview(html);
      const shots = lines.filter((line) => line.startsWith('screenshot '));
      // ASSERT
      expect(run.status).toBe(0);
      expect(shots).toHaveLength(2);
      for (const line of shots) expect(existsSync(line.split(' ').at(-1) ?? '')).toBe(true);
      expect(lines.filter((line) => line.startsWith('✖'))).toEqual([]);
    },
    TIMEOUT,
  );
});

describe('teardown', () => {
  it(
    'leaves no inspect-page browser recorded or running after the command',
    () => {
      // ARRANGE
      const endpoint = path.join(ROOT, '.cache', 'inspect-page', 'endpoint');
      // ACT
      preview(`<!-- slide: spent -->${option('1a')}${option('1b')}`);
      // ASSERT
      expect(existsSync(endpoint)).toBe(false);
    },
    TIMEOUT,
  );
});

describe('failure cases', () => {
  it(
    'exits 1 with one line per contract violation and still renders',
    () => {
      // ARRANGE
      const html = `<!-- slide: spent -->${option('1a', '<p class="w-[16%]">Narrow.</p>')}${option('1b').replace('<div data-spec="build-notes">Parts, tokens, props, i18n keys.</div>', '')}`;
      // ACT
      const { run, lines } = preview(html);
      const violations = lines.filter((line) => line.startsWith('✖'));
      // ASSERT
      expect(run.status).toBe(1);
      expect(violations).toHaveLength(2);
      expect(violations[0]).toContain('arbitrary Tailwind value "w-[16%]"');
      expect(violations[1]).toContain('Option 1b of {#spent} has no build notes');
      expect(lines.filter((line) => line.startsWith('screenshot '))).toHaveLength(2);
    },
    TIMEOUT,
  );

  it(
    'measures text running past its Option at 1440px and names the Option',
    () => {
      // ARRANGE
      const wide =
        '<p class="w-24 whitespace-nowrap">A very long line of text that cannot fit the box it sits in at all, however wide the page is, and keeps going past the Spec page edge too.</p>';
      const html = `<!-- slide: spent -->${option('1a', wide)}${option('1b')}`;
      // ACT
      const { run, lines } = preview(html);
      const violations = lines.filter((line) => line.startsWith('✖'));
      // ASSERT
      expect(run.status).toBe(1);
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('Option 1a of {#spent} has text running past its box at 1440px');
    },
    TIMEOUT,
  );
});
