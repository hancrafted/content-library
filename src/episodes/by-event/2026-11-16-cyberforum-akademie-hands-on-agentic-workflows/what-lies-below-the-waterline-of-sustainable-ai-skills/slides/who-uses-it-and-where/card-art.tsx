import { cn } from '@/shared/lib/utils';

type Tone = 'drop' | 'paper' | 'paper-lit' | 'paper-shade' | 'pin' | 'paper-rule';

const CARD: readonly (readonly [Tone, string])[] = [
  ['drop', 'M4 6L104 6L104 70L4 70Z'],
  ['paper-lit', 'M0 0L100 0L0 64Z'],
  ['paper', 'M100 0L100 64L0 64Z'],
  ['paper-shade', 'M92 64L100 56L100 64Z'],
  ['pin', 'M6 6L60 6L60 9.5L6 9.5Z'],
];

const RULES = 'M6 26L92 26L92 28L6 28ZM6 40L80 40L80 42L6 42Z';

export function CardArt({ ruled = false }: { readonly ruled?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 64"
      preserveAspectRatio="none"
      overflow="visible"
      data-card-art
      className="absolute inset-0 -z-10 size-full"
    >
      {CARD.map(([tone, d]) => (
        <path key={d} d={d} data-tone={tone} />
      ))}
      {ruled && <path d={RULES} data-tone="paper-rule" />}
    </svg>
  );
}

export function PlanLead({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 140"
      preserveAspectRatio="xMidYMax slice"
      data-plan-lead
      className={cn('pointer-events-none absolute inset-0 hidden size-full @2xl:block', className)}
    >
      <path
        d="M236 74C254 62 258 72 268 66"
        data-tone="lead"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
