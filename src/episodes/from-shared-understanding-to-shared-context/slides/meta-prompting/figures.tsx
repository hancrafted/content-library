import { cn } from '@/shared/lib/utils';

/** The AI worker's badge: a spark on a rounded tile, in `ai`. Decorative; the words beside it name it. */
export function AiSpark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true">
      <rect x={4} y={4} width={32} height={32} rx={9} className="fill-ai/15 stroke-ai" strokeWidth={2} />
      <path d="M20 11 l2.5 6.5 L29 20 l-6.5 2.5 L20 29 l-2.5 -6.5 L11 20 l6.5 -2.5 z" className="fill-ai" />
    </svg>
  );
}

/** You, the person who answers, in `human`. Decorative. */
export function PersonFigure({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('shrink-0', className)} aria-hidden="true">
      <circle cx={20} cy={13} r={7} className="fill-human" />
      <path d="M6 38 C 6 26, 34 26, 34 38 Z" className="fill-human" />
    </svg>
  );
}
