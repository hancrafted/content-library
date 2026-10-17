// `npm run episode:spec-preview -- <fragment.html>`: a designer sees and checks its own mock as the user will. It wraps the
// fragment in the Spec frame at the Spec's exact width, compiles design.css for it, runs the Spec contract rules the
// staging test runs, renders every Option at 1440px through `npm run inspect-page` and measures text overflow.
// Always renders; prints one `✖` line per violation and one `screenshot` line per Option; exits 1 on any violation.

import tailwind from '@tailwindcss/postcss';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import { checkFragment } from '../../../src/lib/episode-spec-fragment.pure.ts';
import { optionIds, previewPage } from './spec-preview.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const WIDTH = 1440;

/** The slug whose Slide holds an Option: the nearest slide marker above its figure. */
function slideOf(fragment: string, id: string): string {
  const before = fragment.slice(0, fragment.indexOf(`data-option="${id}"`));
  return [...before.matchAll(/<!-- slide: ([a-z0-9-]+) -->/g)].at(-1)?.[1] ?? '';
}

interface Shot {
  image: { path: string };
  probes: { count: number }[];
}

/** The screenshot path and overflow count in inspect-page's JSON for one Option. */
function readShot(json: string): { path: string; overflow: number } {
  const [entry] = JSON.parse(json) as [Shot];
  return { path: entry.image.path, overflow: entry.probes.reduce((sum, probe) => sum + probe.count, 0) };
}

/** Ends this worktree's inspect-page browser and watchdog, so no process outlives the command. */
function stopBrowser(): void {
  spawnSync('node', [path.join(ROOT, 'skills/visual-check/scripts/inspect-page.ts'), '--stop'], { cwd: ROOT });
}

/** One Option through inspect-page: its screenshot path and how many elements overflow it. */
function inspect(url: string, id: string, out: string): { path: string; overflow: number } {
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

/** What overflow measuring says about an Option, as a violation line when it overflows. */
function overflowLine(fragment: string, id: string, count: number): string[] {
  if (count === 0) return [];
  const slide = slideOf(fragment, id);
  const plural = count === 1 ? '' : 's';
  return [
    `Option ${id} of {#${slide}} has text running past its box at ${WIDTH}px (${count} element${plural}): shorten it or let it wrap.`,
  ];
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
const globals = path.join(ROOT, 'src/app/globals.css');
const css = await postcss([tailwind({ base: dir })]).process(readFileSync(globals, 'utf8'), { from: globals });
writeFileSync(path.join(dir, 'design.css'), css.css);

const violations = checkFragment(fragment);
const url = `file://${path.join(dir, 'index.html')}`;
const shots: string[] = [];
try {
  for (const id of optionIds(fragment)) {
    try {
      const result = inspect(url, id, path.join(dir, `${id}.png`));
      shots.push(`screenshot ${id} ${result.path}`);
      violations.push(...overflowLine(fragment, id, result.overflow));
    } catch (error) {
      violations.push(`Option ${id} could not be rendered: ${(error as Error).message}`);
    }
  }
} finally {
  // inspect-page leaves its shared browser and watchdog running for ten idle minutes; this command ends them.
  stopBrowser();
}
for (const line of violations) console.log(`✖ ${line}`);
for (const line of shots) console.log(line);
console.log(url);
process.exit(violations.length > 0 ? 1 : 0);
