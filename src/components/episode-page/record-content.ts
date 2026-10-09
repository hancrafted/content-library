import type { EpisodeRecord, RuntimeTranslator, Slide } from '@/components/slide-master/episode-record';
import { slideKit } from '@/components/slide-master/slide-kit';
import { placeSections, type PlacedListSlide } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import type { EpisodeContent, EpisodeSection, EpisodeSlide } from './episode-page-container.pure';
import { slideContext } from './slide-context.pure';

/*
 * Turns an Episode record into what one locale of its page renders, the same
 * `EpisodeContent` a legacy Episode builds itself, so the table of contents,
 * the Context drawer and the Slide wrappers read both alike. The one place a
 * Translation key is built at runtime: each Slide's namespace,
 * `episodes.<ep>.slides.<slide>`, which the record's types already tied to the
 * Translation file.
 */

/** A translator namespaced to one Slide, read by runtime key. */
async function translatorOf(locale: Locale, episode: string, slide: string): Promise<RuntimeTranslator> {
  const namespace = `episodes.${episode}.slides.${slide}`;
  return (await getTranslations({ locale, namespace: namespace as never })) as unknown as RuntimeTranslator;
}

/** One placed Slide, rendered: its Canvas from the kit, its notes and Voice script from its own subtree. */
async function renderedSlide(
  locale: Locale,
  refLabel: string,
  { id, slide, level }: PlacedListSlide<Slide>,
): Promise<EpisodeSlide> {
  const t = await translatorOf(locale, slide.episode, slide.slug);
  const notes = slide.notes.map((note) => note.slug);
  const content = slide.content(slideKit({ t, level, notes, refLabel, slide: id }));
  const { notes: noteItems, voiceScript } = slideContext(t, '', slide);
  return {
    slug: slide.slug,
    ...(t.has('title') && { title: t('title') }),
    ...(slide.minutes && { minutes: slide.minutes }),
    content,
    notes: noteItems,
    voiceScript,
  };
}

/** A Section: its first Slide, which names it, holding the rest. */
function sectionOf([head, ...slides]: readonly EpisodeSlide[]): EpisodeSection {
  if (head.title === undefined) throw new Error(`Section "${head.slug}" opens with a Slide that has no title.`);
  return { ...head, title: head.title, slides };
}

/** One locale of an Episode record: the Title slide's text and every Section, walked once (`placeSections`). */
export async function recordContent(record: EpisodeRecord, locale: Locale): Promise<EpisodeContent> {
  const placed = placeSections(record.sections);
  const t = await getTranslations({ locale, namespace: 'episodes' });
  const refLabel = (await getTranslations({ locale, namespace: 'contextDrawer' }))('refNote');
  const sections = await Promise.all(
    placed.map(async (section) => sectionOf(await Promise.all(section.map((s) => renderedSlide(locale, refLabel, s))))),
  );
  return { title: t(`${record.slug}.title`), caption: t(`${record.slug}.caption`), sections };
}
