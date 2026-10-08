import type { Locale } from '@/lib/locale.pure';
import type { EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import type { SpeakerNoteItem, VoiceScriptSegment } from '../../lib/context-drawer.pure';
import { episodeAnchors, sectionAnchor, slideAnchor } from '../../lib/episode.pure';
import type { TocItem, TocSection } from '../../lib/table-of-contents.pure';

/*
 * The Episode record (FE-002): the typed structure an Episode page file hands
 * to `EpisodePageContainer`. Structure is schema; each Slide's `content` is
 * free JSX composed from the Slide master and Slide layouts.
 */

/** One value per locale, so a missing German value fails `tsc`. */
export type PerLocale<T> = Readonly<Record<Locale, T>>;

export interface EpisodeSlide {
  /** Stable once published; becomes the anchor and the catalog key segment. */
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

/** A Section's own slide is its table-of-contents entry, so it always names itself and carries a time. */
export interface EpisodeSection extends Omit<EpisodeSlide, 'title' | 'minutes'> {
  readonly title: string;
  readonly minutes: PerLocale<number>;
  /** Page Slides after the Section's own slide; may be empty. */
  readonly slides: readonly EpisodeSlide[];
}

/** What one locale of an Episode renders: the Title slide's text and the Sections. */
export interface EpisodeContent {
  readonly title: string;
  readonly caption?: string;
  readonly sections: readonly EpisodeSection[];
}

export interface Episode {
  readonly slug: EpisodeSlug;
  /** One recording per locale, shown on the Title slide; optional until recorded. */
  readonly youtube?: PerLocale<string>;
  content(locale: Locale): Promise<EpisodeContent>;
}

/**
 * The table of contents' entries, derived from the same anchors the slides
 * carry, so the two cannot drift. Throws on a bad or duplicate slug, which
 * fails `next dev` and the static build alike. An untitled Slide gets no
 * entry; its minutes (0 when undeclared) are added to the entry it follows,
 * so the Section's total and the reading-time order both stay honest.
 */
export function tocSectionsOf(sections: readonly EpisodeSection[], locale: Locale): TocSection[] {
  episodeAnchors(sections.map(({ slug, slides }) => ({ slug, slides: slides.map((slide) => slide.slug) })));
  return sections.map((section) => {
    const entry: TocSection = {
      id: sectionAnchor(section.slug),
      title: section.title,
      minutes: section.minutes[locale],
      items: [],
    };
    const items: TocItem[] = [];
    for (const slide of section.slides) {
      const minutes = slide.minutes?.[locale] ?? 0;
      if (slide.title === undefined) {
        const [last] = items.slice(-1);
        if (last) last.minutes += minutes;
        else entry.minutes += minutes;
      } else {
        items.push({ id: slideAnchor(section.slug, slide.slug), title: slide.title, minutes });
      }
    }
    return { ...entry, items };
  });
}
