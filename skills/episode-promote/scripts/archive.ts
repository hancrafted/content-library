// `npm run episode:archive -- docs/episodes/<staging-folder>`: files the Staging's Spec Options into the Design
// archive (GLOSSARY.md): `design-archive/<slug>/` gets one page per Slide, the design reference images the pages
// cite and a `design.css` compiled from their markup; `design-archive/index.html` is regenerated from every
// archived Episode. Run from the repo root, before Staging is deleted. Rerunning overwrites the Episode's pages.

import { load } from 'cheerio';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildDesignCss } from '../../new-episode/scripts/spec-css.ts';
import { archiveIndex, designArchive } from './archive.pure.ts';

const ARCHIVE = 'design-archive';
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
});

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
await buildDesignCss(path.join(ARCHIVE, slug));

const episodes = readdirSync(ARCHIVE, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(ARCHIVE, entry.name, 'index.html')))
  .map(({ name }) => ({
    slug: name,
    title: load(readFileSync(path.join(ARCHIVE, name, 'index.html'), 'utf8'))('h1')
      .first()
      .text(),
  }));
writeFileSync(path.join(ARCHIVE, 'index.html'), archiveIndex(episodes));
console.log(
  `archived ${Object.keys(pages).length - 1} Slide page(s) and ${references.length} reference(s) to ${ARCHIVE}/${slug}/`,
);
