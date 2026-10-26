import type { LocalizedSlide, SlideContext } from '@/episodes/components/slide-master/localized-slide';
import { checkedSlug } from '@/episodes/lib/episode.pure';
import { splitCitations, type SpeakerNoteItem, type VoiceScriptSegment } from '@/shared/lib/context-drawer.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import type { ContextItem } from '@/shared/page-chrome/context-drawer/context-drawer-input';

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

/*
 * The ICU leaves (formatted by the adapter, with their arguments) and `refNote`
 * and `markerNote` (read by Slide text, not the drawer) stay out of the strings
 * the drawer receives.
 */
export const NOT_DRAWER_STRINGS = ['explainer', 'sourcesCount', 'citation', 'refNote', 'markerNote'] as const;

/**
 * Throws when a `contextDrawer` string that takes an ICU argument is not left
 * out of the drawer's strings: read unformatted, it fails the page in
 * `next dev` and only logs in the static build.
 */
export function checkDrawerStrings(namespace: Readonly<Record<string, unknown>>): void {
  const kept: readonly string[] = NOT_DRAWER_STRINGS;
  const leaked = Object.entries(namespace)
    .filter(([key, value]) => typeof value === 'string' && /\{\w+/.test(value) && !kept.includes(key))
    .map(([key]) => key);
  if (leaked.length > 0) {
    throw new Error(`contextDrawer strings ${leaked.join(', ')} take an argument: add them to NOT_DRAWER_STRINGS.`);
  }
}

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
