import { EMPHASIS_CLOSE, EMPHASIS_OPEN, splitEmphasis, type TextRange } from '@/episodes/lib/caption-emphasis.pure';
import type { ReactNode } from 'react';
import type { Slide } from './slide';
import type { RuntimeKit, RuntimeTranslator } from './slide-base';
import { ON_SCREEN_TITLE_KEY } from './slide-kit';

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export interface SlideHeaderText {
  readonly title: string;
  readonly caption?: string;
  readonly captionEmphasis?: readonly TextRange[];
  readonly captionNote?: CaptionNote;
  readonly captionNotes?: readonly CaptionNote[];
  readonly action?: ReactNode;
}

export interface CaptionNote {
  readonly note: string;
  readonly label: string;
}

function plain(t: RuntimeTranslator, key: string): string {
  const keep = (chunks: string) => chunks;
  return t.markup(key, { em: keep, b: keep, code: keep });
}

function captionOf(t: RuntimeTranslator): Pick<SlideHeaderText, 'caption' | 'captionEmphasis'> {
  const keep = (chunks: string) => chunks;
  const mark = (chunks: string) => `${EMPHASIS_OPEN}${chunks}${EMPHASIS_CLOSE}`;
  const { text, emphasis } = splitEmphasis(t.markup('caption', { em: keep, b: mark, code: keep }));
  return { caption: text, ...(emphasis.length > 0 && { captionEmphasis: emphasis }) };
}

export function headerTextOf(t: RuntimeTranslator): SlideHeaderText | undefined {
  if (!t.has('title')) return undefined;
  return {
    title: plain(t, t.has(ON_SCREEN_TITLE_KEY) ? ON_SCREEN_TITLE_KEY : 'title'),
    ...(t.has('caption') && captionOf(t)),
  };
}

export function titleTakenBy(slideId: string): string {
  return (
    `The Slide header renders the title of "${slideId}": drop <Title> and the caption from its Scene, ` +
    `or set header: 'authored' on the Episode record.`
  );
}

export interface TitleLines {
  readonly heading?: string;
  readonly caption?: string;
}

export function titleLinesOf(t: RuntimeTranslator): TitleLines {
  return {
    ...(t.has(ON_SCREEN_TITLE_KEY) && { heading: plain(t, ON_SCREEN_TITLE_KEY) }),
    ...(t.has('caption') && { caption: plain(t, 'caption') }),
  };
}

export function captionNoteOf(input: {
  readonly t: RuntimeTranslator;
  readonly note: string | undefined;
  readonly declared: readonly string[];
  readonly markerLabel: (title: string) => string;
}): CaptionNote | undefined {
  const { t, note, declared, markerLabel } = input;
  if (note === undefined) return undefined;
  if (!declared.includes(note)) throw new Error(`The caption names note "${note}", which the Slide does not declare.`);
  return { note, label: markerLabel(t(`notes.${note}.header`)) };
}

export function captionNotesOf(input: {
  readonly t: RuntimeTranslator;
  readonly notes: readonly string[] | undefined;
  readonly declared: readonly string[];
  readonly markerLabel: (title: string) => string;
}): readonly CaptionNote[] | undefined {
  const { notes, ...rest } = input;
  return notes?.map((note) => captionNoteOf({ ...rest, note }) as CaptionNote);
}

export function sharedHeaderOf(
  input: Parameters<typeof captionNoteOf>[0] & { readonly notes?: readonly string[] },
): SlideHeaderText | undefined {
  const text = headerTextOf(input.t);
  const captionNote = captionNoteOf(input);
  const captionNotes = captionNotesOf({ ...input, notes: input.notes });
  return text && { ...text, ...(captionNote && { captionNote }), ...(captionNotes && { captionNotes }) };
}

export function headerWithAction(
  slide: Slide,
  input: { t: RuntimeTranslator; kit: RuntimeKit; notes: readonly string[]; markerLabel: (title: string) => string },
): SlideHeaderText | undefined {
  const header = sharedHeaderOf({
    t: input.t,
    note: slide.captionNote,
    notes: slide.captionNotes,
    declared: input.notes,
    markerLabel: input.markerLabel,
  });
  const action = header && slide.headerAction?.(input.kit);
  return header && (action ? { ...header, action } : header);
}

export function requireTitle(slug: string, title: string | undefined): string {
  if (title === undefined) throw new Error(`Section "${slug}" opens with a Slide that has no title.`);
  return title;
}
