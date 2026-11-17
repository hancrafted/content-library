import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface TermTileProps {
  readonly term: string;
  readonly focal?: boolean;
  readonly chat: ReactNode;
  readonly code: ReactNode;
}

export function TermTile({ term, focal = false, chat, code }: TermTileProps) {
  return (
    <li
      data-tile
      className={cn(
        'focus-group__item flex flex-col gap-3 rounded-lg bg-card p-5 text-card-foreground',
        focal ? 'border-2 border-primary' : 'border border-border',
      )}
    >
      <p className={cn('text-body font-semibold', focal && 'text-primary')}>{term}</p>
      <InView view="chat" as="div" className="flex flex-1 flex-col gap-3">
        {chat}
      </InView>
      <InView view="coding" as="div" className="flex flex-1 flex-col gap-3">
        {code}
      </InView>
    </li>
  );
}

/** A file as a coding agent sees it: its path, then its text. The text is code, never translated. */
export function CodeFile({ path, text }: { readonly path: string; readonly text: string }) {
  return (
    <div className="min-w-0 rounded-md bg-muted">
      <p className="border-b border-border px-3 py-1 font-mono text-caption break-all text-muted-foreground">{path}</p>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-caption whitespace-pre-wrap text-foreground">{text}</pre>
    </div>
  );
}

export function Gloss({ children }: { readonly children: ReactNode }) {
  return <p className="text-caption text-muted-foreground">{children}</p>;
}
