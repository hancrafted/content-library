import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDesignCss } from '../../../src/pipeline/lib/spec-css.ts';
import {
  previewPage,
  previewReport,
  readPresets,
  shotName,
  shotsOf,
  viewportOf,
  type Rendered,
  type Shot,
} from '../../../src/pipeline/lib/spec-preview.pure.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

interface InspectJson {
  image: { path: string };
  probes: { count: number }[];
}

function readShot(json: string): Rendered {
  const [entry] = JSON.parse(json) as [InspectJson];
  return { path: entry.image.path, overflow: entry.probes.reduce((sum, probe) => sum + probe.count, 0) };
}

const PARALLEL = 4;

function inspect(url: string, { id, preset }: Shot, out: string): Promise<Rendered> {
  const stage = `.spec-stage[data-option="${id}"]`;
  const args = [
    path.join(ROOT, 'skills/visual-check/scripts/inspect-page.ts'),
    ...['--url', url, '--width', String(viewportOf(preset).width), '--height', String(viewportOf(preset).height)],
    ...['--clip', stage, '--out', out, '--probe', `${stage} [data-overflow]`],
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

const template = readFileSync(path.join(ROOT, 'skills/new-episode/assets/spec-template.html'), 'utf8');
const presets = readPresets(readFileSync(path.join(ROOT, 'skills/new-episode/references/spec-calibration.md'), 'utf8'));
for (const preset of presets)
  writeFileSync(path.join(dir, `index.${preset.name}.html`), previewPage(template, fragment, preset));
await buildDesignCss(dir);

const shots = shotsOf(fragment, presets);
const url = (shot: Shot) => `file://${path.join(dir, `index.${shot.preset.name}.html`)}`;
const settled = await settleAll(
  shots.map((shot) => () => inspect(url(shot), shot, path.join(dir, `${shotName(shot)}.png`))),
);
const outcomes = shots.map((shot, index) => {
  const result = settled[index]!;
  return { shot, result: result.status === 'fulfilled' ? result.value : (result.reason as Error) };
});
const report = previewReport(fragment, outcomes);
for (const line of report.lines) console.log(line);
console.log(dir);
process.exit(report.failed ? 1 : 0);
