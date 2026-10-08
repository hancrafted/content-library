import type { ContextItem } from '@/components/context-drawer/context-drawer-input';
import { splitCitations, type SpeakerNoteItem, type VoiceScriptSegment } from '../../lib/context-drawer.pure';
import { checkedSlug, slidesInPageOrder, targetAnchor, titleAnchor, type PlacedSlide } from '../../lib/episode.pure';
import type { EpisodeSlide, PlacedEpisodeSection } from './episode-page-container.pure';

/*
 * THE SEAM. This file and `context-drawer-input.ts` are the only place the
 * Context drawer meets an Episode record. They turn placed Slides into
 * `ContextItem`s: item id = the id the walk placed the Slide at (the id its
 * wrapper carries), note target = the full element id. A Slide-registration
 * contract replaces these two files; the drawer itself is untouched (FE-010 §8).
 */

/*
 * Episode-side validation of a Slide's notes and script. It lives in the
 * adapter, not beside the drawer's types, so the drawer's lib code imports
 * nothing from the Episode modules (FE-010 §8).
 */

function assertUniqueSlugs(kind: string, slide: string, slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    checkedSlug(slug);
    if (seen.has(slug)) throw new Error(`Duplicate ${kind} slug "${slug}" on "${slide}": slugs must be unique.`);
    seen.add(slug);
  }
}

function checkCitations(slide: string, note: SpeakerNoteItem): void {
  const sources = note.sources ?? [];
  assertUniqueSlugs(
    'source',
    `${slide}/${note.slug}`,
    sources.map((source) => source.slug),
  );
  for (const part of splitCitations(note.description)) {
    if (typeof part === 'string' || part.cite <= sources.length) continue;
    throw new Error(
      `Note "${note.slug}" on "${slide}" cites [${part.cite}] but has ${sources.length} source(s): a marker must name one.`,
    );
  }
}

/** Throws on a malformed Slide context, so a broken Episode fails `next dev` and the static build. */
export function checkContext(
  slide: string,
  notes: readonly SpeakerNoteItem[],
  segments: readonly VoiceScriptSegment[],
): void {
  assertUniqueSlugs(
    'note',
    slide,
    notes.map((n) => n.slug),
  );
  assertUniqueSlugs(
    'segment',
    slide,
    segments.map((s) => s.slug),
  );
  notes.forEach((n) => checkedSlug(n.target));
  notes.forEach((n) => checkCitations(slide, n));
  for (const { slug, from, to } of segments) {
    if (to < from) throw new Error(`Segment "${slug}" on "${slide}" ends (${to}) before it starts (${from}).`);
  }
}

/** The note a context reference names; throws when the Slide has no such note. */
export function checkedNote(notes: readonly SpeakerNoteItem[], slug: string): SpeakerNoteItem {
  const note = notes.find((candidate) => candidate.slug === slug);
  if (!note) throw new Error(`No note "${slug}" on this Slide: a context reference must name one of its notes.`);
  return note;
}

function itemOf({ id, slide }: PlacedSlide<EpisodeSlide>): ContextItem {
  const notes = slide.notes ?? [];
  const script = slide.voiceScript ?? [];
  checkContext(id, notes, script);
  return {
    id,
    title: slide.title,
    notes: notes.map((note) => ({ ...note, target: targetAnchor(id, note.target) })),
    script,
  };
}

/**
 * The Title slide's item: no notes, no script, and the explainer of how the
 * drawer works, which the drawer shows on both tabs (FE-010).
 */
function titleItem(explainer: string): ContextItem {
  return { id: titleAnchor(), notes: [], script: [], explainer };
}

/**
 * The Title slide's item, then one item per placed Slide in page order (the
 * order the table of contents lists). Each note's `target` is resolved to the
 * full id its Slide's markup carries. Throws on a malformed Slide, so a broken
 * Episode fails `next dev` and the static build alike.
 */
export function contextItemsOf(placed: readonly PlacedEpisodeSection[], explainer: string): ContextItem[] {
  return [titleItem(explainer), ...slidesInPageOrder(placed).map(itemOf)];
}
