import type { EpisodeRecord, Slide } from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import { ownTranslator, slideKit, type EpisodeKitInput } from '@/components/slide-master/slide-kit';
import { placeSections, type PlacedListSlide, type PlacedSlide } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { EpisodeContent, EpisodeSlide, PlacedEpisodeSection } from './episode-page-container.pure';
import { slideContext } from './slide-context.pure';

/*
 * Turns an Episode record into what one locale of its page renders, the same
 * placed `EpisodeContent` the table of contents, the Context drawer and the
 * Slide wrappers read, each Slide under the id its position gives it. Every
 * Slide is read from its own messages, the Episode's text from the record's.
 */

/** One locale's site-wide translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** One placed Slide, rendered: its Scene from the kit, its notes and Voice script from its own text. */
function renderedSlide(
  episode: EpisodeKitInput,
  { id, slide, level }: PlacedListSlide<Slide>,
): PlacedSlide<EpisodeSlide> {
  const t = ownTranslator(slide.messages[episode.locale], episode.locale);
  const notes = slide.notes.map((note) => note.slug);
  const content = slide.content(slideKit(episode, { t, level, notes, slideId: id }));
  const { notes: noteItems, voiceScript, minutes } = slideContext(t, slide, episode.locale);
  return {
    id,
    slide: {
      slug: slide.slug,
      ...(t.has('title') && { title: t('title') }),
      minutes,
      content,
      notes: noteItems,
      voiceScript,
    },
  };
}

/** A Section: its first Slide, which names it, holding the rest. */
function sectionOf([head, ...pages]: readonly PlacedSlide<EpisodeSlide>[]): PlacedEpisodeSection {
  const { title } = head.slide;
  if (title === undefined) throw new Error(`Section "${head.slide.slug}" opens with a Slide that has no title.`);
  return { id: head.id, slide: { ...head.slide, title, slides: pages.map(({ slide }) => slide) }, slides: pages };
}

/**
 * One locale of an Episode record: the Title slide's text and every Section,
 * walked once (`placeSections`); `translatorOf` serves only the site-wide
 * Context reference label. The walk's
 * ids are also every kit's `slideHref` targets, so a link cannot drift from
 * the anchor it points at.
 */
export async function recordContent(
  record: EpisodeRecord,
  locale: Locale,
  translatorOf: TranslatorOf,
): Promise<EpisodeContent> {
  const placed = placeSections<Slide>(record.sections);
  const episode: EpisodeKitInput = {
    episode: record.slug,
    locale,
    anchors: new Map(placed.flat().map(({ id, slide }) => [slide.slug, id])),
    refLabel: (await translatorOf('contextDrawer'))('refNote'),
  };
  const sections = placed.map((section) => sectionOf(section.map((s) => renderedSlide(episode, s))));
  const { title, caption } = record.messages[locale];
  return { title, caption, sections };
}
