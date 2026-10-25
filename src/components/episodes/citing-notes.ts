import { noteHeaderOf } from '@/components/slide-master/own-translator';
import type { Slide } from '@/components/slide-master/slide';
import { placeSections, TITLE_ANCHOR } from '@/lib/episode.pure';
import { episodeRoute, isEpisodeSlug, type EpisodeSlug } from '@/lib/routes';
import type { SlideSource } from '@/lib/slide-source.pure';
import { findEpisode } from './registry';

/*
 * The Speaker notes that cite one Research question, as its page lists them (design-ADR 0016, Citations rule 6). Only
 * listed Episodes are named: an unlisted one lives under its Event alone, and a public Research page does not point
 * readers at it.
 */

/** One note that cites the question: its Episode, its header, and where on the Episode page its Slide sits. */
export interface CitingNote {
  readonly episode: EpisodeSlug;
  readonly episodeTitle: string;
  readonly header: string;
  /** The Episode page's logical path. */
  readonly path: string;
  /** The id of the Slide wrapper that carries the note: the Title slide's, or the one the walk placed it at. */
  readonly anchor: string;
}

function citingNoteOf(episode: EpisodeSlug, slide: string, note: string): CitingNote {
  const record = findEpisode(episode);
  const base = { episode, episodeTitle: record.messages.en.title, path: episodeRoute(episode) };
  if (slide === 'title') {
    return { ...base, header: noteHeaderOf({ ...record.messages.en }, note, 'en'), anchor: TITLE_ANCHOR };
  }
  const placed = placeSections<Slide>(record.sections)
    .flat()
    .find((entry) => entry.slide.slug === slide);
  if (placed === undefined) throw new Error(`"${episode}" has no Slide "${slide}" for a note that cites research.`);
  return { ...base, header: noteHeaderOf(placed.slide.messages.en, note, 'en'), anchor: placed.id };
}

/** Every note of a listed Episode that cites the Research question `id`, once each, in the order the sources give. */
export function citingNotes(sources: readonly SlideSource[], id: string): CitingNote[] {
  const seen = new Set<string>();
  return sources.flatMap(({ episode, slide, note, research }) => {
    const key = `${episode}/${slide}/${note}`;
    if (research !== id || !isEpisodeSlug(episode) || seen.has(key)) return [];
    seen.add(key);
    return [citingNoteOf(episode, slide, note)];
  });
}
