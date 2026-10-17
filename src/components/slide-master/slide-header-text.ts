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
}

/** A rich message as plain text: the default tags keep their words and drop their markup. */
function plain(t: RuntimeTranslator, key: string): string {
  const keep = (chunks: string) => chunks;
  return t.markup(key, { em: keep, b: keep, code: keep });
}

/** The Slide header's text for a titled Slide: its `heading` when it has one, else its `title`, and its caption. */
export function headerTextOf(t: RuntimeTranslator): SlideHeaderText | undefined {
  if (!t.has('title')) return undefined;
  return {
    title: plain(t, t.has(ON_SCREEN_TITLE_KEY) ? ON_SCREEN_TITLE_KEY : 'title'),
    ...(t.has('caption') && { caption: plain(t, 'caption') }),
  };
}

/** What `Title` throws in a Scene whose heading the Slide header renders. */
export function titleTakenBy(slideId: string): string {
  return (
    `The Slide header renders the title of "${slideId}": drop <Title> and the caption from its Scene, ` +
    `or set header: 'authored' on the Episode record.`
  );
}
