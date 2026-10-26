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
  type EpisodeComposition,
  type HeaderMode,
  type Slide,
  type SlideEntrance,
} from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import { placeSections } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { episodeRoute, type EpisodesPathSlug } from '@/lib/routes';
import type { ReactNode } from 'react';

/*
 * Turns an Episode record into what one locale of its page renders: the
 * Title slide's text and every Slide, localized, in page order. The table of
 * contents, the Context drawer and the Slide wrappers all fold this one list,
 * each Slide under the id its position gives it.
 */

/** One locale's site-wide translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** What the page lends the Episode: the site-wide translator, and the route it is served at when not its own. */
export interface PageContext {
  readonly translatorOf: TranslatorOf;
  /** The page's Episode id, or the tooling page's slug: an Event's copy is named by its id, never by its slug alone. */
  readonly id: EpisodesPathSlug;
  /** The logical path the page is served at, which `slideHref` links on: the Episode's own unless an Event presents it. */
  readonly route?: string;
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
 * `translatorOf` serves only the site-wide Context reference and marker labels. The walk's
 * ids are also every kit's `slideHref` targets, so a link cannot drift from
 * the anchor it points at.
 */
export async function recordContent(
  record: EpisodeComposition,
  locale: Locale,
  { translatorOf, id, route = episodeRoute(id) }: PageContext,
): Promise<EpisodeContent> {
  const drawer = await translatorOf('contextDrawer');
  const episode: EpisodeContext = {
    episode: id,
    route,
    locale,
    placed: placeSections<Slide>(record.sections).flat(),
    referenceLabels: { ref: drawer('refNote'), marker: (title) => drawer('markerNote', { title }) },
    header: headerModeOf(record),
  };
  const { title, caption } = record.messages[locale];
  return {
    title,
    // A title Slide's own caption belongs to its Hero motif, so it takes the Title slide's caption line.
    caption: (record.title && titleCaptionOf(record.title, locale)) ?? caption,
    minutes: episodeMinutes(record, locale),
    titleContext: titleContext(record, locale),
    ...(record.title && { hero: localizeTitleScene(record.title, episode) }),
    header: episode.header,
    entrance: record.entrance ?? 'typewriter',
    slides: episode.placed.map((placed) => localizeSlide(placed, episode)),
  };
}
