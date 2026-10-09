import type { PerLocale } from '@/components/slide-master/episode-record';
import type { Locale } from '@/lib/locale.pure';
import type { EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import type { SpeakerNoteItem, VoiceScriptSegment } from '../../lib/context-drawer.pure';
import type { PlacedSection } from '../../lib/episode.pure';
import type { TocItem, TocSection } from '../../lib/table-of-contents.pure';

/*
 * The Episode record (FE-002): the typed structure an Episode page file hands
 * to `EpisodePageContainer`. Structure is schema; each Slide's `content` is
 * free JSX composed from the Slide master and Slide layouts.
 */

export type { PerLocale } from '@/components/slide-master/episode-record';

export interface EpisodeSlide {
  /** Stable once published; becomes the anchor and the Translation key segment. */
  readonly slug: string;
  /**
   * Plain text for the table of contents; the Slide renders its own heading.
   * Leave it out of a purely visual Slide: it renders but is not listed (FE-002).
   */
  readonly title?: string;
  /** Spoken reading time per locale, in minutes; counts as 0 when left out. */
  readonly minutes?: PerLocale<number>;
  readonly content: ReactNode;
  /** Speaker notes (FE-010); each `target` is the short name of an element of this Slide. */
  readonly notes?: readonly SpeakerNoteItem[];
  /** Voice script (FE-010). */
  readonly voiceScript?: readonly VoiceScriptSegment[];
}

/** A Section's own slide is its table-of-contents entry, so it always names itself; its minutes count as 0 when left out. */
export interface EpisodeSection extends Omit<EpisodeSlide, 'title'> {
  readonly title: string;
  /** Page Slides after the Section's own slide; may be empty. */
  readonly slides: readonly EpisodeSlide[];
}

/** What one locale of an Episode renders: the Title slide's text and the Sections. */
export interface EpisodeContent {
  readonly title: string;
  readonly caption?: string;
  readonly sections: readonly EpisodeSection[];
}

/**
 * Legacy: an Episode that renders itself per locale. Episodes written as Slide
 * files are an `EpisodeRecord` (`slide-master/episode-record.ts`) instead,
 * which `recordContent` turns into the same `EpisodeContent`. Delete with the
 * last legacy Episode.
 */
export interface Episode {
  readonly slug: EpisodeSlug;
  /** One recording per locale, shown on the Title slide; optional until recorded. */
  readonly youtube?: PerLocale<string>;
  content(locale: Locale): Promise<EpisodeContent>;
}

/** An Episode's Section as the one walk (`slidesOf`) places it: its id and its page Slides' ids. */
export type PlacedEpisodeSection = PlacedSection<EpisodeSection>;

/** A Slide's spoken minutes in one locale; 0 when it declares none. */
function minutesIn(slide: Pick<EpisodeSlide, 'minutes'>, locale: Locale): number {
  return slide.minutes?.[locale] ?? 0;
}

/**
 * The table of contents' entries: a fold over the placed Slides, so each entry
 * carries the very id its Slide wrapper does and the two cannot drift. An
 * untitled Slide gets no entry; its minutes (0 when undeclared) are added to
 * the entry it follows, so the Section's total and the reading-time order both
 * stay honest.
 */
export function tocSectionsOf(placed: readonly PlacedEpisodeSection[], locale: Locale): TocSection[] {
  return placed.map(({ id, slide: section, slides }) => {
    const entry: TocSection = { id, title: section.title, minutes: minutesIn(section, locale), items: [] };
    const items: TocItem[] = [];
    for (const { id: slideId, slide } of slides) {
      const minutes = minutesIn(slide, locale);
      if (slide.title === undefined) {
        const owner = items.at(-1) ?? entry;
        owner.minutes += minutes;
        owner.unlisted = [...(owner.unlisted ?? []), { id: slideId, minutes }];
      } else {
        items.push({ id: slideId, title: slide.title, minutes });
      }
    }
    return { ...entry, items };
  });
}
