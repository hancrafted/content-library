/*
 * The paper on the matrix's pictures that belongs to this Slide, lifted from the approved Spec's Option 18a (feedback
 * 3, decision 46): the index card in the Spec's construction (lit and plain halves, a folded corner, its red pin
 * stripe and ruled lines over a flat drop) and the dashed lead from the card box to the dive plan. The Spec draws the
 * card turned a few degrees; here it is drawn square and the Slide turns it. The pictures themselves are the shared
 * `SquarePicture`; these sit on them as its extras. Tones in `slide.module.css`.
 */

import { cn } from '@/shared/lib/utils';

type Tone = 'drop' | 'paper' | 'paper-lit' | 'paper-shade' | 'pin' | 'paper-rule';

/** The card, 100 by 64 like the Spec's index cards; the drop overhangs its bottom right as the Spec's does. */
const CARD: readonly (readonly [Tone, string])[] = [
  ['drop', 'M4 6L104 6L104 70L4 70Z'],
  ['paper-lit', 'M0 0L100 0L0 64Z'],
  ['paper', 'M100 0L100 64L0 64Z'],
  ['paper-shade', 'M92 64L100 56L100 64Z'],
  ['pin', 'M6 6L60 6L60 9.5L6 9.5Z'],
];

/** The ruled lines a blank card carries; a scribbled card has the captain's words on them instead. */
const RULES = 'M6 26L92 26L92 28L6 28ZM6 40L80 40L80 42L6 42Z';

/** An index card behind its words, stretched to the element it sits in; `ruled` draws its lines. */
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

/**
 * The dashed lead from the card box to the pinned dive plan, in the shared picture's own 400 by 140 space and fill,
 * so it lands on the drawing. Hidden where the picture stacks its labels in flow (below `@2xl`), as the trip is.
 */
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
