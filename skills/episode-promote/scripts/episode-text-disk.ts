import { readFileSync } from 'node:fs';
import path from 'node:path';
import { episodeOutline } from '../../../src/episodes/lib/episode-outline.ts';
import { episodeText, type SlideMessages } from '../../../src/pipeline/lib/episode-text.pure.ts';

function messages(file: string): SlideMessages {
  return JSON.parse(readFileSync(file, 'utf8')) as SlideMessages;
}

export function episodeTextOf(root: string, folder: string, locale: string): string {
  const episodeDir = path.join(root, 'src/episodes', folder);
  const episode = messages(path.join(episodeDir, 'i18n', `${locale}.json`));
  const sections = episodeOutline(folder).sections.map((slides) =>
    slides.map((slide) => ({
      slug: slide.slug,
      messages: messages(path.join(root, slide.textSource, `${locale}.json`)),
    })),
  );
  return episodeText({ episode: { title: episode.title ?? folder, caption: episode.caption }, sections });
}
