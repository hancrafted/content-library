// `npm run episode:spec-preview -- <fragment.html>`: a designer sees and checks its own mock as the user will. It wraps the
// fragment in the Spec frame at the Spec's exact width, compiles design.css for it, runs the Spec contract rules the
// staging test runs, renders every Option at every render preset of the Spec calibration through `npm run
// inspect-page` and measures text overflow. Always renders; prints one `✖` line per violation (an overflow names its
// Option and preset) and one `screenshot` line per Option and preset; exits 1 on any violation.
// The renders run a few at a time against inspect-page's one shared browser: each is a short node process.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDesignCss } from '../../../src/pipeline/lib/spec-css.ts';
import {
  optionIds,
  previewPage,
  previewReport,
  readPresets,
  type Preset,
  type Rendered,
} from '../../../src/pipeline/lib/spec-preview.pure.ts';

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

/** How many inspect-page processes run at once: enough to hide page-load waits, few enough for a loaded machine. */
const PARALLEL = 4;

/** One Option at one preset through inspect-page: its screenshot path and how many elements overflow it. */
function inspect(url: string, at: { id: string; preset: Preset }, out: string): Promise<Rendered> {
  const { id, preset } = at;
  const args = [
    path.join(ROOT, 'skills/visual-check/scripts/inspect-page.ts'),
    ...['--url', url, '--width', String(preset.width), '--height', String(preset.height)],
    ...['--clip', `[data-option="${id}"]`, '--out', out, '--probe', `[data-option="${id}"] [data-overflow]`],
  ];
  return new Promise((resolve, reject) => {
    const child = spawn('node', args, { cwd: ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => (stdout += chunk));
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk));
    child.on('error', reject);
    child.on('close', (status) =>
      status === 0 ? resolve(readShot(stdout)) : reject(new Error((stderr || stdout).trim())),
    );
  });
}

/** Runs the jobs `PARALLEL` at a time and settles each, so one failed render does not stop the others. */
async function settleAll<T>(jobs: (() => Promise<T>)[]): Promise<PromiseSettledResult<T>[]> {
  const results = new Array<PromiseSettledResult<T>>(jobs.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    for (let index = next++; index < jobs.length; index = next++) {
      results[index] = await jobs[index]!().then(
        (value) => ({ status: 'fulfilled', value }),
        (reason: unknown) => ({ status: 'rejected', reason }),
      );
    }
  };
  await Promise.all(Array.from({ length: Math.min(PARALLEL, jobs.length) }, worker));
  return results;
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

const frame = readFileSync(path.join(ROOT, 'skills/new-episode/assets/spec-template.html'), 'utf8');
writeFileSync(path.join(dir, 'index.html'), previewPage(frame, fragment));
await buildDesignCss(dir);

const url = `file://${path.join(dir, 'index.html')}`;
const presets = readPresets(readFileSync(path.join(ROOT, 'skills/new-episode/references/spec-calibration.md'), 'utf8'));
const pairs = optionIds(fragment).flatMap((id) => presets.map((preset) => ({ id, preset })));
const settled = await settleAll(
  pairs.map(
    ({ id, preset }) =>
      () =>
        inspect(url, { id, preset }, path.join(dir, `${id}-${preset.name}.png`)),
  ),
);
const renders = new Map(pairs.map(({ id, preset }, index) => [`${id}@${preset.name}`, settled[index]!]));
const report = previewReport(fragment, presets, (id, preset) => {
  const result = renders.get(`${id}@${preset.name}`)!;
  if (result.status === 'rejected') throw result.reason as Error;
  return result.value;
});
for (const line of report.lines) console.log(line);
console.log(url);
process.exit(report.failed ? 1 : 0);
