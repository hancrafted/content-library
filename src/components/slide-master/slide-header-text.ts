import { EMPHASIS_CLOSE, EMPHASIS_OPEN, splitEmphasis, type TextRange } from '@/lib/caption-emphasis.pure';
import type { RuntimeTranslator } from './slide-base';
import { ON_SCREEN_TITLE_KEY } from './slide-kit';

/*
 * The text the shared Slide header shows for a Slide (FE-012), read from
 * the Slide's own messages: the same keys a Scene authoring its own header reads.
 */

/** What the shared Slide header shows besides the computed Eyebrow: the on-screen title and the caption, as plain text. */
export interface SlideHeaderText {
  readonly title: string;
  readonly caption?: string;
  /** The caption's `<b>` runs, which the header sets off. */
  readonly captionEmphasis?: readonly TextRange[];
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

/** A caption a Slide's own messages give, as plain text; undefined when they give none. */
export function captionTextOf(t: RuntimeTranslator): string | undefined {
  return t.has('caption') ? plain(t, 'caption') : undefined;
}
