'use client';

import { useCopy } from '@/shared/hooks/use-copy';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { CopyIcon, TickIcon } from './copy-icons';

const CONFIRM_MILLISECONDS = 1600;

export interface CopyWords {
  readonly copy: string;
  readonly copied: string;
}

const BUTTON = {
  base: 'inline-flex shrink-0 cursor-pointer items-center justify-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
  icon: 'size-8 rounded-md text-muted-foreground hover:text-foreground',
  big: 'gap-2 rounded-md bg-primary px-5 py-3 text-body font-semibold text-primary-foreground hover:opacity-90',
} as const;

function useConfirmed() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (at === 0) return;
    const timer = setTimeout(() => setAt(0), CONFIRM_MILLISECONDS);
    return () => clearTimeout(timer);
  }, [at]);
  return [at !== 0, () => setAt((now) => now + 1)] as const;
}

// decision: FE-001 §1
interface CopyButtonProps {
  readonly text: string;
  readonly words: CopyWords;
  readonly className?: string;
  readonly big?: boolean;
}

export function CopyButton({ text, words, className, big = false }: CopyButtonProps) {
  const [announced, copy] = useCopy(words.copied);
  const [confirmed, confirm] = useConfirmed();
  const Icon = confirmed ? TickIcon : CopyIcon;
  return (
    <>
      <button
        type="button"
        aria-label={words.copy}
        data-copy-button={big ? 'big' : 'icon'}
        data-copied={confirmed}
        onClick={() => void copy(text).then((ok) => ok && confirm())}
        className={cn(BUTTON.base, big ? BUTTON.big : BUTTON.icon, className)}
      >
        <Icon />
        {big ? <span aria-hidden="true">{confirmed ? words.copied : words.copy}</span> : null}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announced}
      </span>
    </>
  );
}

export type LineWhere = 'shell' | 'agent';

const PLACES: Record<LineWhere, { box: string; mark: string; prompt: string }> = {
  shell: { box: 'border border-border bg-muted', mark: '', prompt: '$ ' },
  agent: { box: 'border border-ai/40 bg-background shadow-md shadow-ai/15', mark: '✻ ', prompt: '> ' },
};

interface CopyLineProps {
  readonly text: string;
  readonly where: LineWhere;
  readonly focal?: boolean;
  readonly big?: boolean;
  readonly words: CopyWords;
}

export function CopyLine({ text, where, focal = false, big = false, words }: CopyLineProps) {
  const place = PLACES[where];
  return (
    <div
      data-copy-line={text}
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg py-1 pr-1 pl-4 font-mono text-body',
        big && 'flex-wrap gap-3 p-3',
        place.box,
        focal && 'border-2 border-primary',
      )}
    >
      <span className="min-w-0 break-all py-2">
        <span className="text-ai">{place.mark}</span>
        <span className="text-muted-foreground">{place.prompt}</span>
        <span className={cn('text-primary', focal && 'font-semibold')}>{text}</span>
      </span>
      <CopyButton text={text} words={words} big={big} />
    </div>
  );
}
