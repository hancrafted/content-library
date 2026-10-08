import { checkedSlug } from './episode.pure';

/*
 * The Context drawer's content shapes and pure logic (FE-010). The shapes are
 * content, never design: no field carries layout, style, placement or markup.
 */

/** One talking point (a Speaker note item), pointing at the Slide element it explains. */
export interface SpeakerNoteItem {
  /** Stable key identity for the catalog; never a position. */
  readonly slug: string;
  readonly header: string;
  readonly description: string;
  /** Links or further reading; rendered as selectable text. */
  readonly sources?: readonly string[];
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

/** Shown on the trigger; matched on `event.code` so a layout cannot move it. */
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

function assertUniqueSlugs(kind: string, slide: string, slugs: readonly string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    checkedSlug(slug);
    if (seen.has(slug)) throw new Error(`Duplicate ${kind} slug "${slug}" on "${slide}": slugs must be unique.`);
    seen.add(slug);
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
  for (const { slug, from, to } of segments) {
    if (to < from) throw new Error(`Segment "${slug}" on "${slide}" ends (${to}) before it starts (${from}).`);
  }
}
