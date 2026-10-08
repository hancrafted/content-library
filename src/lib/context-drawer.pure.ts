import { checkedSlug } from './episode.pure';

/*
 * The Context drawer's content shapes and pure logic (FE-010). The shapes are
 * content, never design: no field carries layout, style, placement or markup.
 */

/** One source of a note: a stable slug, an `https` URL and its localized, human title. */
export interface NoteSource {
  readonly slug: string;
  readonly url: string;
  readonly title: string;
}

/** One talking point (a Speaker note item), pointing at the Slide element it explains. */
export interface SpeakerNoteItem {
  /** Stable key identity for the catalog; never a position. */
  readonly slug: string;
  readonly header: string;
  readonly description: string;
  /** Further reading, numbered in this order: `[n]` in `description` cites source n. */
  readonly sources?: readonly NoteSource[];
  readonly image?: { readonly src: string; readonly alt: string };
  /** Short element name; the full id is `targetAnchor(slideAnchor, target)`. */
  readonly target: string;
}

/** One timed passage of a Voice script. */
export interface VoiceScriptSegment {
  readonly slug: string;
  /** Start and end, in minutes into the Slide. */
  readonly from: number;
  readonly to: number;
  readonly title: string;
  readonly keywords: readonly string[];
  readonly script: string;
  /** How this segment closes and hands to the next Section. */
  readonly bridge?: string;
}

/** Everything the drawer shows for one Slide; each note's `target` is the full element id. */
export interface ContextSlide {
  readonly anchor: string;
  /** The Slide's plain title, to label its entry. */
  readonly title: string;
  readonly notes: readonly SpeakerNoteItem[];
  readonly segments: readonly VoiceScriptSegment[];
}

/** The slice of a `KeyboardEvent` the drawer reads. */
export interface KeyEventLike {
  readonly code: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly repeat: boolean;
}

/** The two tabs, defined once: the type, the tab order and every element id derive from this. */
export const DRAWER_TABS = ['notes', 'script'] as const;
export type DrawerTab = (typeof DRAWER_TABS)[number];

/** How the card sits from `md`: beside the Slides (they make room) or over them. */
export const DRAWER_MODES = ['side', 'overlay'] as const;
export type DrawerMode = (typeof DRAWER_MODES)[number];
export const DEFAULT_DRAWER_MODE: DrawerMode = 'side';

/** Whether the Episode grid keeps a column for the card, which changes at once rather than animating. */
export function reservesSpace(mode: DrawerMode, open: boolean): boolean {
  return open && mode === 'side';
}

/** The drawer panel's element id; the trigger's `aria-controls` points at it. */
export const DRAWER_PANEL_ID = 'context-panel';

/** Element ids of one tab and its tab panel, derived from the tab id. */
export function drawerIds(tab: DrawerTab): { tab: string; panel: string } {
  return { tab: `context-tab-${tab}`, panel: `${DRAWER_PANEL_ID}-${tab}` };
}

/** Shown on the trigger (from `md`); matched on `event.code` so a layout cannot move it. */
export const SHORTCUT_LABEL = 'Alt+N';

export function matchesShortcut(event: KeyEventLike): boolean {
  const onlyAlt = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
  return onlyAlt && !event.repeat && event.code === 'KeyN';
}

export function drawerKeyAction(event: KeyEventLike, open: boolean): 'toggle' | 'close' | null {
  if (matchesShortcut(event)) return 'toggle';
  return open && event.code === 'Escape' ? 'close' : null;
}

/** APG tabs: arrows wrap, Home and End jump; any other key is not ours. */
export function tabAfter(key: string, current: string, tabs: readonly string[]): string | null {
  const at = tabs.indexOf(current);
  const step: Record<string, number> = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: tabs.length - 1 };
  if (!(key in step)) return null;
  return tabs[(step[key] + tabs.length) % tabs.length];
}

/** APG menu: vertical arrows wrap, Home and End jump; any other key is not ours. */
export function menuItemAfter(key: string, current: string, items: readonly string[]): string | null {
  const at = items.indexOf(current);
  const step: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 };
  if (!(key in step)) return null;
  return items[(step[key] + items.length) % items.length];
}

/** The drawer's heading: the current Slide's title, or the fallback while none is current. */
export function titleOfSlide(
  anchor: string | null,
  slides: readonly { readonly anchor: string; readonly title: string }[],
  fallback: string,
): string {
  return slides.find((slide) => slide.anchor === anchor)?.title ?? fallback;
}

/** The Slide to show: the active one if it has context, else the first; none when empty. */
export function currentSlideAnchor(active: string | null, anchors: readonly string[]): string | null {
  if (active !== null && anchors.includes(active)) return active;
  return anchors[0] ?? null;
}

/** Minutes as `m:ss`, e.g. 0.75 gives `0:45`. */
export function formatMark(minutes: number): string {
  const total = Math.round(minutes * 60);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** One piece of a description: plain text, or a citation marker pointing at source `cite` (1-based). */
export type DescriptionPart = string | { readonly cite: number };

const CITATION_RE = /\[([1-9]\d*)\]/g;

/** Splits `text [1] more [2]` into text and citation markers, in order; other brackets stay text. */
export function splitCitations(text: string): DescriptionPart[] {
  const parts: DescriptionPart[] = [];
  let from = 0;
  for (const match of text.matchAll(CITATION_RE)) {
    if (match.index > from) parts.push(text.slice(from, match.index));
    parts.push({ cite: Number(match[1]) });
    from = match.index + match[0].length;
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

/** A source's host as muted meta: `https://www.anthropic.com/x` gives `anthropic.com`. */
export function sourceDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

/** A note's 1-based number on its Slide, the superscript a context reference shows. */
export function noteNumber(notes: readonly { readonly slug: string }[], slug: string): number {
  const at = notes.findIndex((note) => note.slug === slug);
  if (at < 0) throw new Error(`No note "${slug}" on this Slide: a context reference must name one of its notes.`);
  return at + 1;
}

/** Data attributes the Slide's context references and the drawer's notes share, so the two cannot drift. */
export const CONTEXT_REF_ATTR = 'data-context-ref';
export const CONTEXT_ACTIVE_ATTR = 'data-context-active';
export const NOTE_TARGET_ATTR = 'data-note-target';
export const CITATION_ATTR = 'data-citation';
export const PINNED_ATTR = 'data-context-pinned';

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
