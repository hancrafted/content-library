'use client';

import { useCopy } from '@/shared/hooks/use-copy';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { CopyIcon, TickIcon } from './icons';

/** How long a copy button shows its tick before it shows the copy mark again. */
const CONFIRM_MS = 1600;

/** The words a copy button says: its name, and what its live region announces after a copy. */
export interface CopyWords {
  readonly copy: string;
  readonly copied: string;
}

/**
 * A copy button: copies `text` through the shared clipboard, shows a tick for a moment when the clipboard took it, and
 * announces it to a screen reader. Nothing it shows outlives a reload (FE-001, transient).
 */
export function CopyButton({ text, words, className }: { text: string; words: CopyWords; className?: string }) {
  const [announced, copy] = useCopy(words.copied);
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (at === 0) return;
    const timer = setTimeout(() => setAt(0), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [at]);
  const Icon = at === 0 ? CopyIcon : TickIcon;
  return (
    <>
      <button
        type="button"
        aria-label={words.copy}
        data-copied={at !== 0}
        onClick={() => void copy(text).then((ok) => ok && setAt((now) => now + 1))}
        className={cn(
          'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Icon />
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announced}
      </span>
    </>
  );
}

/** Where a line is typed: the terminal's shell (`$`), or the AI agent's prompt (`✻ >`, with the AI agent's glow). */
export type LineWhere = 'shell' | 'agent';

/** Each place's box and the marks before the line. */
const PLACES: Record<LineWhere, { box: string; mark: string; prompt: string }> = {
  shell: { box: 'border border-border bg-muted', mark: '', prompt: '$ ' },
  agent: { box: 'border border-ai/40 bg-background shadow-md shadow-ai/15', mark: '✻ ', prompt: '> ' },
};

/**
 * One exact line to type, with its copy button: the terminal's `$ ` or the AI agent's `✻ > ` before it, the line in
 * `primary`. `focal` marks the one line the whole Slide leads to.
 */
export function CopyLine({
  text,
  where,
  focal = false,
  words,
}: {
  text: string;
  where: LineWhere;
  focal?: boolean;
  words: CopyWords;
}) {
  const place = PLACES[where];
  return (
    <div
      data-copy-line={text}
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg py-1 pr-1 pl-4 font-mono text-body',
        place.box,
        focal && 'border-2 border-primary',
      )}
    >
      <span className="min-w-0 break-all py-2">
        <span className="text-ai">{place.mark}</span>
        <span className="text-muted-foreground">{place.prompt}</span>
        <span className={cn('text-primary', focal && 'font-semibold')}>{text}</span>
      </span>
      <CopyButton text={text} words={words} />
    </div>
  );
}
