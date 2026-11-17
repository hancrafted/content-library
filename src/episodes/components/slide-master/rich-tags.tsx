import type { RichTag } from './slide-base';

// decision: FE-002 §3
export const DEFAULT_RICH_TAGS: Readonly<Record<'em' | 'b' | 'code', RichTag>> = {
  em: (chunks) => <em className="text-secondary not-italic">{chunks}</em>,
  b: (chunks) => <b className="font-semibold text-foreground">{chunks}</b>,
  code: (chunks) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">{chunks}</code>
  ),
};
