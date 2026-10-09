import type { ReactNode } from 'react';
import type { SpeakerNoteItem, VoiceScriptSegment } from '../../lib/context-drawer.pure';
import type { PlacedSection } from '../../lib/episode.pure';
import type { TocItem, TocSection } from '../../lib/table-of-contents.pure';

/*
 * The Episode record (FE-002): the typed structure an Episode page file hands
 * to `EpisodePageContainer`. Structure is schema; each Slide's `content` is
 * free JSX composed from the Slide master and Slide layouts.
 */

export interface EpisodeSlide {
  /** Stable once published; becomes the anchor and the Translation key segment. */
  readonly slug: string;
  /**
   * Plain text for the table of contents; the Slide renders its own heading.
   * Leave it out of a purely visual Slide: it renders but is not listed (FE-002).
   */
  readonly title?: string;
  /** Spoken reading time in this locale, in minutes: where its Voice script's last segment ends, 0 without one. */
  readonly minutes: number;
  readonly content: ReactNode;
  /** Speaker notes (FE-010); each `target` is the short name of an element of this Slide. */
  readonly notes?: readonly SpeakerNoteItem[];
  /** Voice script (FE-010). */
  readonly voiceScript?: readonly VoiceScriptSegment[];
}

/** A Section's own slide is its table-of-contents entry, so it always names itself. */
export interface EpisodeSection extends Omit<EpisodeSlide, 'title'> {
  readonly title: string;
  /** Page Slides after the Section's own slide; may be empty. */
  readonly slides: readonly EpisodeSlide[];
}

/** What one locale of an Episode renders: the Title slide's text and the placed Sections. */
export interface EpisodeContent {
  readonly title: string;
  readonly caption?: string;
  readonly sections: readonly PlacedEpisodeSection[];
}

/** An Episode's Section as the one walk (`placeSections`) places it: its id and its page Slides' ids. */
export type PlacedEpisodeSection = PlacedSection<EpisodeSection>;

/**
 * The table of contents' entries: a fold over the placed Slides, so each entry
 * carries the very id its Slide wrapper does and the two cannot drift. An
 * untitled Slide gets no entry; its minutes are added to
 * the entry it follows, so the Section's total and the reading-time order both
 * stay honest.
 */
export function tocSectionsOf(placed: readonly PlacedEpisodeSection[]): TocSection[] {
  return placed.map(({ id, slide: section, slides }) => {
    const entry: TocSection = { id, title: section.title, minutes: section.minutes, items: [] };
    const items: TocItem[] = [];
    for (const { id: slideId, slide } of slides) {
      const { minutes } = slide;
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
