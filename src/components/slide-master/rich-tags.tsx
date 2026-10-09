import type { RichTag } from './episode-record';

/**
 * The tags every Slide's `t.rich` knows without passing them (FE-002 §3): a
 * Translation string may write `<em>`, `<b>` or `<code>` and the kit renders
 * it. A Slide passes a tag of the same name only to style it differently.
 * Styled with site tokens, so both themes hold.
 */
export const DEFAULT_RICH_TAGS: Readonly<Record<'em' | 'b' | 'code', RichTag>> = {
  em: (chunks) => <em className="text-secondary not-italic">{chunks}</em>,
  b: (chunks) => <b className="font-semibold text-foreground">{chunks}</b>,
  code: (chunks) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">{chunks}</code>
  ),
};
