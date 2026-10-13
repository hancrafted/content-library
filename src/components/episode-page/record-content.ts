import {
  episodeMinutes,
  localizeSlide,
  titleContext,
  type EpisodeContext,
  type LocalizedSlide,
} from '@/components/slide-master/localized-slide';
import type { EpisodeRecord, Slide } from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';

/*
 * Turns an Episode record into what one locale of its page renders: the
 * Title slide's text and every Slide, localized, in page order. The table of
 * contents, the Context drawer and the Slide wrappers all fold this one list,
 * each Slide under the id its position gives it.
 */

/** One locale's site-wide translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** What one locale of an Episode renders: the Title slide's text and its Slides in page order. */
export interface EpisodeContent {
  readonly title: string;
  readonly caption?: string;
  /** The whole reading time in minutes (`episodeMinutes`): the total the table of contents counts down from. */
  readonly minutes: number;
  readonly slides: readonly LocalizedSlide[];
  /** The Title slide's own Speaker notes and Voice script; both empty for an Episode that gives it none. */
  readonly titleContext: Pick<LocalizedSlide, 'notes' | 'voiceScript'>;
}

/**
 * One locale of an Episode record, walked once (`placeSections`);
 * `translatorOf` serves only the site-wide Context reference label. The walk's
 * ids are also every kit's `slideHref` targets, so a link cannot drift from
 * the anchor it points at.
 */
export async function recordContent(
  record: EpisodeRecord,
  locale: Locale,
  translatorOf: TranslatorOf,
): Promise<EpisodeContent> {
  const episode: EpisodeContext = {
    episode: record.slug,
    locale,
    placed: placeSections<Slide>(record.sections).flat(),
    refLabel: (await translatorOf('contextDrawer'))('refNote'),
  };
  const { title, caption } = record.messages[locale];
  return {
    title,
    caption,
    minutes: episodeMinutes(record, locale),
    titleContext: titleContext(record, locale),
    slides: episode.placed.map((placed) => localizeSlide(placed, episode)),
  };
}
