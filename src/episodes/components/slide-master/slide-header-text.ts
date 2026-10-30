import { EMPHASIS_CLOSE, EMPHASIS_OPEN, splitEmphasis, type TextRange } from '@/episodes/lib/caption-emphasis.pure';
import type { ReactNode } from 'react';
import type { Slide } from './slide';
import type { RuntimeKit, RuntimeTranslator } from './slide-base';
import { ON_SCREEN_TITLE_KEY } from './slide-kit';

/*
 * The text the shared Slide header shows for a Slide (design-ADR-0012), read from
 * the Slide's own messages: the same keys a Scene authoring its own header reads.
 */

/** What the shared Slide header shows besides the computed Eyebrow: the on-screen title and the caption, as plain text. */
export interface SlideHeaderText {
  readonly title: string;
  readonly caption?: string;
  /** The caption's `<b>` runs, which the header sets off. */
  readonly captionEmphasis?: readonly TextRange[];
  /** The Speaker note the caption ends on with a Context marker: its slug and the marker's accessible name. */
  readonly captionNote?: CaptionNote;
  /** The Slide's `headerAction`, rendered: the header draws it right-aligned in the title row. */
  readonly action?: ReactNode;
}

/** A caption's Context marker: the note it opens and the marker's accessible name. */
export interface CaptionNote {
  readonly note: string;
  readonly label: string;
}

/** A rich message as plain text: the default tags keep their words and drop their markup. */
function plain(t: RuntimeTranslator, key: string): string {
  const keep = (chunks: string) => chunks;
  return t.markup(key, { em: keep, b: keep, code: keep });
}

/** The caption as plain text and, when it marks any, where its `<b>` runs lie. */
function captionOf(t: RuntimeTranslator): Pick<SlideHeaderText, 'caption' | 'captionEmphasis'> {
  const keep = (chunks: string) => chunks;
  const mark = (chunks: string) => `${EMPHASIS_OPEN}${chunks}${EMPHASIS_CLOSE}`;
  const { text, emphasis } = splitEmphasis(t.markup('caption', { em: keep, b: mark, code: keep }));
  return { caption: text, ...(emphasis.length > 0 && { captionEmphasis: emphasis }) };
}

/** The Slide header's text for a titled Slide: its `heading` when it has one, else its `title`, and its caption with its emphasis. */
export function headerTextOf(t: RuntimeTranslator): SlideHeaderText | undefined {
  if (!t.has('title')) return undefined;
  return {
    title: plain(t, t.has(ON_SCREEN_TITLE_KEY) ? ON_SCREEN_TITLE_KEY : 'title'),
    ...(t.has('caption') && captionOf(t)),
  };
}

/** What `Title` throws in a Scene whose heading the Slide header renders. */
export function titleTakenBy(slideId: string): string {
  return (
    `The Slide header renders the title of "${slideId}": drop <Title> and the caption from its Scene, ` +
    `or set header: 'authored' on the Episode record.`
  );
}

/** The lines of the Title slide a hero Scene gives in its own messages. */
export interface TitleLines {
  readonly heading?: string;
  readonly caption?: string;
}

/** The `h1` and caption a Title slide Scene gives in its own messages, as plain text; each undefined when it gives none. */
export function titleLinesOf(t: RuntimeTranslator): TitleLines {
  return {
    ...(t.has(ON_SCREEN_TITLE_KEY) && { heading: plain(t, ON_SCREEN_TITLE_KEY) }),
    ...(t.has('caption') && { caption: plain(t, 'caption') }),
  };
}

/** The marker a Slide's caption ends on: the note it names must be one the Slide declares. */
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

/** The shared Slide header's text, with the Context marker its caption ends on when the Slide names a note for it. */
export function sharedHeaderOf(input: Parameters<typeof captionNoteOf>[0]): SlideHeaderText | undefined {
  const text = headerTextOf(input.t);
  const captionNote = captionNoteOf(input);
  return text && { ...text, ...(captionNote && { captionNote }) };
}

/** The shared header's text for a Slide, with the action its `headerAction` renders, when it declares one. */
export function headerWithAction(
  slide: Slide,
  input: { t: RuntimeTranslator; kit: RuntimeKit; notes: readonly string[]; markerLabel: (title: string) => string },
): SlideHeaderText | undefined {
  const header = sharedHeaderOf({
    t: input.t,
    note: slide.captionNote,
    declared: input.notes,
    markerLabel: input.markerLabel,
  });
  const action = header && slide.headerAction?.(input.kit);
  return header && (action ? { ...header, action } : header);
}

/** The title of the Slide that names a Section; a section slide always has one. */
export function requireTitle(slug: string, title: string | undefined): string {
  if (title === undefined) throw new Error(`Section "${slug}" opens with a Slide that has no title.`);
  return title;
}
