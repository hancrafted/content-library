import { splitCitations, type SpeakerNoteItem, type VoiceScriptSegment } from './context-drawer.pure';
import { checkedSlug } from './episode.pure';

/*
 * Episode-side validation of a Slide's notes and script. It lives apart from
 * context-drawer.pure.ts so the drawer's lib code imports nothing from the
 * Episode modules (FE-010 §8).
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
