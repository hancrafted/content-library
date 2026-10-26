// `npm run episode:archive -- docs/episodes/<staging-folder>`: files the Staging's Spec Options into the Design
// archive (GLOSSARY.md): `design-archive/<slug>/` gets one page, `index.html`, holding every Slide, the design
// reference images it cites and the Spec's compiled `design.css`; `design-archive/index.html`, the dashboard, is
// regenerated from every archived Episode. Run from the repo root, before Staging is deleted. Rerunning replaces the
// Episode's folder.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { archivedEpisode, archiveIndex } from '../../../src/pipeline/lib/archive-dashboard.pure.ts';
import { designArchive } from '../../../src/pipeline/lib/archive.pure.ts';
import { buildDesignCss } from '../../../src/pipeline/lib/spec-css.ts';

const ARCHIVE = 'design-archive';
/** The archive pages' own styles, kept beside the skill's other page assets. */
const asset = (name: string): string => readFileSync(path.join(import.meta.dirname, '../assets', name), 'utf8');
const staging = process.argv[2]?.replace(/\/$/, '');
if (!staging || !existsSync(path.join(staging, 'spec/spec.html'))) {
  console.error('usage: npm run episode:archive -- docs/episodes/<staging-folder>  (it must hold spec/spec.html)');
  process.exit(1);
}

const feedbackRoot = path.join(staging, 'feedback');
const feedback: Record<string, string> = {};
if (existsSync(feedbackRoot)) {
  for (const round of readdirSync(feedbackRoot)) {
    const file = path.join('feedback', round, 'feedback.md');
    if (existsSync(path.join(staging, file))) feedback[file] = readFileSync(path.join(staging, file), 'utf8');
  }
}
const eventsFile = path.join(staging, 'events.jsonl');

const { slug, pages, references } = designArchive({
  staging,
  spec: readFileSync(path.join(staging, 'spec/spec.html'), 'utf8'),
  feedback,
  events: existsSync(eventsFile) ? readFileSync(eventsFile, 'utf8') : '',
  style: asset('archive-episode.css'),
});

rmSync(path.join(ARCHIVE, slug), { recursive: true, force: true });
for (const [file, html] of Object.entries(pages)) {
  mkdirSync(path.dirname(path.join(ARCHIVE, file)), { recursive: true });
  writeFileSync(path.join(ARCHIVE, file), html);
}
for (const reference of references) {
  const from = path.join(staging, reference);
  if (!existsSync(from)) {
    console.error(`! ${from} is cited but missing; its image stays broken`);
    continue;
  }
  const to = path.join(ARCHIVE, slug, reference);
  mkdirSync(path.dirname(to), { recursive: true });
  copyFileSync(from, to);
}
// The Spec's markup holds every class the archive pages use, and `globals.css` keeps `design-archive/` out of
// Tailwind's scan, so the archive's design.css is the Spec's, compiled where Tailwind still sees it.
copyFileSync(await buildDesignCss(path.join(staging, 'spec')), path.join(ARCHIVE, slug, 'design.css'));

const episodes = readdirSync(ARCHIVE, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(ARCHIVE, entry.name, 'index.html')))
  .map(({ name }) => archivedEpisode(name, readFileSync(path.join(ARCHIVE, name, 'index.html'), 'utf8')));
writeFileSync(path.join(ARCHIVE, 'index.html'), archiveIndex(episodes, asset('archive-dashboard.css')));
const archived = episodes.find((episode) => episode.slug === slug);
console.log(
  `archived ${archived?.slides ?? 0} Slide(s) and ${references.length} reference(s) to ${ARCHIVE}/${slug}/index.html`,
);
