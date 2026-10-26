// `npm run episode:spec-preview -- <fragment.html>`: a designer sees and checks its own mock as the user will. It wraps the
// fragment in the Spec frame at the Spec's exact width, compiles design.css for it, runs the Spec contract rules the
// staging test runs, renders every Option at 1440px through `npm run inspect-page` and measures text overflow.
// Always renders; prints one `✖` line per violation and one `screenshot` line per Option; exits 1 on any violation.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { previewPage, previewReport, WIDTH, type Rendered } from '../../../src/pipeline/lib/spec-preview.pure.ts';
import { buildDesignCss } from './spec-css.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

interface Shot {
  image: { path: string };
  probes: { count: number }[];
}

/** The screenshot path and overflow count in inspect-page's JSON for one Option. */
function readShot(json: string): Rendered {
  const [entry] = JSON.parse(json) as [Shot];
  return { path: entry.image.path, overflow: entry.probes.reduce((sum, probe) => sum + probe.count, 0) };
}

/** One Option through inspect-page: its screenshot path and how many elements overflow it. */
function inspect(url: string, id: string, out: string): Rendered {
  const run = spawnSync(
    'node',
    [
      path.join(ROOT, 'skills/visual-check/scripts/inspect-page.ts'),
      ...['--url', url, '--width', String(WIDTH), '--clip', `[data-option="${id}"]`, '--out', out],
      ...['--probe', `[data-option="${id}"] [data-overflow]`],
    ],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (run.status !== 0) throw new Error((run.stderr || run.stdout).trim());
  return readShot(run.stdout);
}

const [arg, ...extra] = process.argv.slice(2);
if (arg === undefined || extra.length > 0) {
  console.error('✖ usage: npm run episode:spec-preview -- <fragment.html>');
  process.exit(1);
}
const fragmentFile = path.resolve(arg);
const fragment = readFileSync(fragmentFile, 'utf8');
const dir = fragmentFile.replace(/\.html$/, '') + '.preview';
mkdirSync(dir, { recursive: true });

const frame = readFileSync(path.join(ROOT, 'skills/new-episode/assets/spec-frame.html'), 'utf8');
writeFileSync(path.join(dir, 'index.html'), previewPage(frame, fragment));
await buildDesignCss(dir);

const url = `file://${path.join(dir, 'index.html')}`;
const report = previewReport(fragment, (id) => inspect(url, id, path.join(dir, `${id}.png`)));
for (const line of report.lines) console.log(line);
console.log(url);
process.exit(report.failed ? 1 : 0);
