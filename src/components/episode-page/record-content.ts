import {
  episodeMinutes,
  localizeSlide,
  localizeTitleScene,
  titleCaptionOf,
  titleContext,
  type EpisodeContext,
  type LocalizedSlide,
  type SlideContext,
} from '@/components/slide-master/localized-slide';
import {
  headerModeOf,
  type EpisodeRecord,
  type HeaderMode,
  type Slide,
  type SlideEntrance,
} from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import type { CitedResearch } from '@/lib/citations.pure';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactNode } from 'react';

/*
 * Turns an Episode record into what one locale of its page renders: the
 * Title slide's text and every Slide, localized, in page order. The table of
 * contents, the Context drawer and the Slide wrappers all fold this one list,
 * each Slide under the id its position gives it.
 */

/** One locale's site-wide translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** What the site lends an Episode page: its translator for site-wide labels and every Research question a note may cite. */
export interface SiteContext {
  readonly translatorOf: TranslatorOf;
  readonly research: readonly CitedResearch[];
}

/** What one locale of an Episode renders: the Title slide's text and its Slides in page order. */
export interface EpisodeContent {
  readonly title: string;
  readonly caption?: string;
  /** The whole reading time in minutes (`episodeMinutes`): the total the table of contents counts down from. */
  readonly minutes: number;
  readonly slides: readonly LocalizedSlide[];
  /** The Title slide's own Speaker notes and Voice script; both empty for an Episode that gives it none. */
  readonly titleContext: SlideContext;
  /** The record's authored Title slide Scene, rendered; absent for the shared glow. */
  readonly hero?: ReactNode;
  /** Whether the Slide wrapper renders each Slide's header (`shared`) or each Scene does (`authored`). */
  readonly header: HeaderMode;
  readonly entrance: SlideEntrance;
}

/**
 * One locale of an Episode record, walked once (`placeSections`);
 * `translatorOf` serves only the site-wide Context reference and marker labels,
 * and `research` is every Research question a Speaker note may cite. The walk's
 * ids are also every kit's `slideHref` targets, so a link cannot drift from
 * the anchor it points at.
 */
export async function recordContent(
  record: EpisodeRecord,
  locale: Locale,
  { translatorOf, research }: SiteContext,
): Promise<EpisodeContent> {
  const drawer = await translatorOf('contextDrawer');
  const episode: EpisodeContext = {
    episode: record.slug,
    locale,
    placed: placeSections<Slide>(record.sections).flat(),
    referenceLabels: { ref: drawer('refNote'), marker: (title) => drawer('markerNote', { title }) },
    header: headerModeOf(record),
    research,
  };
  const { title, caption } = record.messages[locale];
  return {
    title,
    // A title Slide's own caption belongs to its Hero motif, so it takes the Title slide's caption line.
    caption: (record.title && titleCaptionOf(record.title, locale)) ?? caption,
    minutes: episodeMinutes(record, locale),
    titleContext: titleContext(record, locale, research),
    ...(record.title && { hero: localizeTitleScene(record.title, episode) }),
    header: episode.header,
    entrance: record.entrance ?? 'typewriter',
    slides: episode.placed.map((placed) => localizeSlide(placed, episode)),
  };
}
