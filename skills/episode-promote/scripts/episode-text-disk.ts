import { layeredText } from '../../../src/episodes/lib/episode-outline-text.ts';
import { episodeOutline, type Locale } from '../../../src/episodes/lib/episode-outline.ts';
import { episodeText, type SlideMessages } from '../../../src/pipeline/lib/episode-text.pure.ts';

export function episodeTextOf(root: string, folder: string, locale: Locale): string {
  const outline = episodeOutline(folder);
  const episode = layeredText(root, outline.text, locale) as SlideMessages;
  const sections = outline.sections.map((slides) =>
    slides.map((slide) => ({ slug: slide.slug, messages: layeredText(root, slide.text, locale) as SlideMessages })),
  );
  return episodeText({ episode: { title: episode.title ?? folder, caption: episode.caption }, sections });
}
