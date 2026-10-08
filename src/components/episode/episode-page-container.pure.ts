import type { Locale } from '@/lib/locale.pure';
import type { EpisodeSlug } from '@/lib/routes';
import type { ReactNode } from 'react';
import { episodeAnchors, sectionAnchor, slideAnchor } from '../../lib/episode.pure';
import type { TocSection } from '../../lib/table-of-contents.pure';

/*
 * The Episode record (FE-002): the typed structure an Episode page file hands
 * to `EpisodePageContainer`. Structure is schema; each Slide's `content` is
 * free JSX composed from the Slide master and Slide layouts.
 */

/** One value per locale, so a missing German value fails `tsc`. */
export type PerLocale<T> = Readonly<Record<Locale, T>>;

/** Reserved (FE-002): one talking point. Provisional shape, not yet rendered. */
interface SpeakerNote {
  readonly title: string;
  readonly caption: string;
}

/** Reserved (FE-002): one teleprompter passage. Provisional shape, not yet rendered. */
interface VoiceCue {
  readonly at: string;
  readonly cue: string;
  readonly text: string;
  readonly keywords?: readonly string[];
  readonly bridge?: string;
}

export interface EpisodeSlide {
  /** Stable once published; becomes the anchor and the catalog key segment. */
  readonly slug: string;
  /** Plain text for the table of contents; the Slide renders its own heading. */
  readonly title: string;
  /** Spoken reading time per locale, in minutes. */
  readonly minutes: PerLocale<number>;
  readonly content: ReactNode;
  readonly notes?: readonly SpeakerNote[];
  readonly voiceScript?: readonly VoiceCue[];
}

export interface EpisodeSection extends EpisodeSlide {
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
 * fails `next dev` and the static build alike.
 */
export function tocSectionsOf(sections: readonly EpisodeSection[], locale: Locale): TocSection[] {
  episodeAnchors(sections.map(({ slug, slides }) => ({ slug, slides: slides.map((slide) => slide.slug) })));
  return sections.map((section) => ({
    id: sectionAnchor(section.slug),
    title: section.title,
    minutes: section.minutes[locale],
    items: section.slides.map((slide) => ({
      id: slideAnchor(section.slug, slide.slug),
      title: slide.title,
      minutes: slide.minutes[locale],
    })),
  }));
}
