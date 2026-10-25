// `npm run episode:harvest -- docs/episodes/<staging>`: renders `<staging>/harvest.json` into `<staging>/harvest.html`
// through the template in `assets/harvest-report.html`, and opens it. It writes two sections itself, over any section
// of the same key: research, a card per question in `<staging>/research/`, and instances, a card per adapted Slide
// the Episode holds. Exits 1 listing every problem the page would draw wrong. The page is Promotion's gate: the user keeps or strikes each card and pastes the decisions back.

import { execFile, execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { poolChangesSince } from '../../../scripts/slide-history.pure.ts';
import { poolFolderOf } from '../../../scripts/slide-instance.pure.ts';
import { instancesOf } from '../../../scripts/slide-promote.pure.ts';
import { repo } from '../../../scripts/slide-repo.ts';
import { harvestReport, type Harvest, type Section } from './harvest-report.pure.ts';
import { instanceSection, type InstanceFacts } from './instance-cards.pure.ts';
import { researchSection } from './research-cards.pure.ts';

const TEMPLATE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/harvest-report.html');
const staging = process.argv[2]?.replace(/\/$/, '');
const source = staging && path.join(staging, 'harvest.json');
if (!source || !existsSync(source)) {
  console.error('usage: npm run episode:harvest -- docs/episodes/<staging-folder>  (it must hold harvest.json)');
  process.exit(1);
}

/** Each research file the Run staged, by repo path, in folder order. */
function stagedResearch(): { path: string; markdown: string }[] {
  const root = path.join(staging, 'research');
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(root, entry.name, 'research.md')))
    .map((entry) => path.join(root, entry.name, 'research.md'))
    .sort()
    .map((file) => ({ path: file, markdown: readFileSync(file, 'utf8') }));
}

/** Each instance the Episode holds, with every Episode an update changes and what changed the pool Slide since. */
function episodeInstances(episode: string): InstanceFacts[] {
  const git = (args: readonly string[]) => execFileSync('git', args, { encoding: 'utf8' });
  return instancesOf(episode, repo).map(({ instance: { names, commit }, affected }) => ({
    slug: names.as,
    folder: names.to,
    origin: names.origin,
    affected,
    poolChanges: poolChangesSince(poolFolderOf(names.origin), commit, git),
  }));
}

/** The sections the command writes itself, each only when it has a card. */
function ownSections(episode: string): Section[] {
  return [researchSection(stagedResearch()), instanceSection(episodeInstances(episode))].filter(
    ({ cards }) => cards.length > 0,
  );
}

const out = path.join(staging, 'harvest.html');
try {
  const read = JSON.parse(readFileSync(source, 'utf8')) as Harvest;
  const own = ownSections(read.episode);
  const others = read.sections.filter(({ key }) => !['research', 'instances'].includes(key));
  const harvest: Harvest = { ...read, sections: [...others, ...own] };
  const page = harvestReport(readFileSync(TEMPLATE, 'utf8'), harvest);
  // Formatted like every committed file, so the Staging commit that carries the page passes the format gate.
  const config = (await resolveConfig(out)) ?? {};
  writeFileSync(out, await format(page, { ...config, filepath: out }));
  writeFileSync(source, await format(JSON.stringify(harvest), { ...config, filepath: source }));
} catch (error) {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
console.log(`wrote ${out}`);
if (process.platform === 'darwin') execFile('open', [out]);
