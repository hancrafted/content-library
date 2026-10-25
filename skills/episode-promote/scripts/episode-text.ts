// `npm run episode:text -- <slug> [--locale de]`: prints an Episode's words as markdown, read from its Slides'
// `i18n/` in Section order. The reading copy for an agent or a human; never commit its output.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeOutline } from './episode-outline.ts';
import { episodeText, type SlideMessages } from './episode-text.pure.ts';

const args = process.argv.slice(2);
const localeAt = args.indexOf('--locale');
const locale = localeAt === -1 ? 'en' : args[localeAt + 1];
const slug = args.find((arg, index) => !arg.startsWith('--') && (localeAt === -1 || index !== localeAt + 1));
const folder = path.join('src/components/episodes', slug ?? '');
if (!slug || !locale || !existsSync(folder)) {
  console.error('usage: npm run episode:text -- <slug> [--locale de]  (run from the repo root)');
  process.exit(1);
}

function messages(file: string): SlideMessages {
  return JSON.parse(readFileSync(file, 'utf8')) as SlideMessages;
}

const episode = messages(path.join(folder, 'i18n', `${locale}.json`));
const sections = episodeOutline(folder).sections.map((slides) =>
  slides.map((slide) => ({
    slug: slide.slug,
    messages: messages(path.join(slide.folder, 'i18n', `${locale}.json`)),
  })),
);
process.stdout.write(episodeText({ episode: { title: episode.title ?? slug, caption: episode.caption }, sections }));
