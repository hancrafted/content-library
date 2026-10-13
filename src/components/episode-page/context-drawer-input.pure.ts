import type { ContextItem } from '@/components/context-drawer/context-drawer-input';
import type { LocalizedSlide, SlideContext } from '@/components/slide-master/localized-slide';
import { splitCitations, type SpeakerNoteItem, type VoiceScriptSegment } from '@/lib/context-drawer.pure';
import { checkedSlug, TITLE_ANCHOR } from '@/lib/episode.pure';

/*
 * THE SEAM. This file and `context-drawer-input.ts` are the only place the
 * Context drawer meets an Episode record. They turn Localized Slides into
 * `ContextItem`s: item id = the id the walk placed the Slide at (the id its
 * wrapper carries); each note keeps its short `target`, which the drawer looks
 * up inside that wrapper (FE-010 §8).
 */

/*
 * Episode-side validation of a Slide's notes and script. It lives in the
 * adapter, not beside the drawer's types, so the drawer's lib code imports
 * nothing from the Episode modules (FE-010 §8).
 */

function assertValidUniqueSlugs(kind: string, slide: string, slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    checkedSlug(slug);
    if (seen.has(slug)) throw new Error(`Duplicate ${kind} slug "${slug}" on "${slide}": slugs must be unique.`);
    seen.add(slug);
  }
}

function checkCitations(slide: string, note: SpeakerNoteItem): void {
  const sources = note.sources ?? [];
  assertValidUniqueSlugs(
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
  assertValidUniqueSlugs(
    'note',
    slide,
    notes.map((n) => n.slug),
  );
  assertValidUniqueSlugs(
    'segment',
    slide,
    segments.map((s) => s.slug),
  );
  notes.forEach((n) => checkedSlug(n.target));
  notes.forEach((n) => checkCitations(slide, n));
}

function itemOf({ id, title, notes, voiceScript }: LocalizedSlide): ContextItem {
  checkContext(id, notes, voiceScript);
  return { id, title, notes, script: voiceScript };
}

/**
 * The Title slide's item: its own notes and script when its text holds any
 * (FE-004 §6); otherwise none, and the explainer of how the drawer works,
 * which the drawer shows on both tabs (FE-010).
 */
function titleItem(explainer: string, context: SlideContext | undefined): ContextItem {
  const notes = context?.notes ?? [];
  const script = context?.voiceScript ?? [];
  if (notes.length === 0 && script.length === 0) return { id: TITLE_ANCHOR, notes: [], script: [], explainer };
  checkContext(TITLE_ANCHOR, notes, script);
  return { id: TITLE_ANCHOR, notes, script };
}

/**
 * The Title slide's item, then one item per Slide in page order (the order
 * the table of contents lists). Throws on a malformed Slide, so a broken
 * Episode fails `next dev` and the static build alike.
 */
export function contextItemsOf(
  slides: readonly LocalizedSlide[],
  explainer: string,
  title?: SlideContext,
): ContextItem[] {
  return [titleItem(explainer, title), ...slides.map(itemOf)];
}
