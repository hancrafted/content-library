import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/*
 * The factory line's everyday shapes: the document that moves down the line, each station's tool, the AI badge and the
 * person. All decorative: the words beside them carry the meaning.
 */

/**
 * A document's look: `crisp` a clear one, `dull` a vague one drawn toward `muted-foreground` (quality is never a hue
 * of its own), `queued` one waiting in a pile-up, in `warning`, `machine` one the AI reads, such as a work order.
 */
export type DocumentTone = 'crisp' | 'dull' | 'queued' | 'machine';

const DOCUMENT: Record<DocumentTone, { page: string; fold: string; lines: string }> = {
  crisp: { page: 'fill-card stroke-foreground', fold: 'stroke-foreground', lines: 'stroke-foreground/50' },
  dull: {
    page: 'fill-card stroke-muted-foreground',
    fold: 'stroke-muted-foreground',
    lines: 'stroke-muted-foreground/50',
  },
  queued: {
    page: 'fill-(--warning)/40 stroke-(--warning)',
    fold: 'stroke-(--warning)',
    lines: 'stroke-(--warning)/60',
  },
  machine: { page: 'fill-machine/15 stroke-machine', fold: 'stroke-machine', lines: 'stroke-machine/50' },
};

/** The unit that moves down the line: a sheet with a folded corner and three lines of text. */
export function DocumentIcon({ tone, className }: { tone: DocumentTone; className?: string }) {
  const look = DOCUMENT[tone];
  return (
    <svg viewBox="0 0 20 24" className={cn('shrink-0', className)} aria-hidden="true">
      <path d="M2 1.5h10.5l5.5 5.5v15.5H2z" className={look.page} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M12.5 1.5V7H18" className={cn('fill-none', look.fold)} strokeWidth={1.5} strokeLinejoin="round" />
      <path
        d="M5 11.5h10M5 15h10M5 18.5h6"
        className={cn('fill-none', look.lines)}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The work centres of the swing maker's line, left to right. */
export type StationId = 'sales' | 'design' | 'build' | 'review' | 'delivery';

/** Each station's tool: a speech bubble, a pencil, a wrench, a magnifier, a truck. */
const TOOL: Record<StationId, ReactNode> = {
  sales: <path d="M4 6h16v10H9l-5 4z" strokeLinejoin="round" />,
  design: (
    <>
      <path d="M4 20l4-1L19 8l-3-3L5 16z" strokeLinejoin="round" />
      <path d="M14 7l3 3" />
    </>
  ),
  build: <path d="M14 6a4 4 0 0 0-5 5l-5 5 3 3 5-5a4 4 0 0 0 5-5l-2 2-2-1-1-2z" strokeLinejoin="round" />,
  review: (
    <>
      <circle cx="10" cy="10" r="5" />
      <path d="M14 14l5 5" strokeLinecap="round" />
    </>
  ),
  delivery: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </>
  ),
};

/** A station's tool, drawn in `foreground`, or in `ai` when AI runs the station. */
export function StationIcon({ id, ai = false, className }: { id: StationId; ai?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-7 shrink-0', className)} aria-hidden="true">
      <g className={cn('fill-none', ai ? 'stroke-ai' : 'stroke-foreground')} strokeWidth={1.75}>
        {TOOL[id]}
      </g>
    </svg>
  );
}

/** The AI badge: a small robot head in `ai`, its eyes in the text colour around it. */
export function AiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-4 shrink-0', className)} aria-hidden="true">
      <rect x="2.5" y="5" width="11" height="8" rx="2" className="fill-none stroke-ai" strokeWidth={1.5} />
      <path d="M8 2.5V5" className="stroke-ai" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="6" cy="9" r="1" className="fill-current" />
      <circle cx="10" cy="9" r="1" className="fill-current" />
    </svg>
  );
}

/** A person in `human`: the customer at the line's ends, or the reviewer at a bench. */
export function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-7 shrink-0', className)} aria-hidden="true">
      <circle cx="12" cy="7" r="4" className="fill-none stroke-human" strokeWidth={1.75} />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" className="fill-none stroke-human" strokeWidth={1.75} strokeLinecap="round" />
    </svg>
  );
}
