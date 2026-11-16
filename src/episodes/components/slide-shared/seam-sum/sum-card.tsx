import { cn } from '@/shared/lib/utils';
import { CardHeader } from './card-header';
import { Cross, SeamIcon, Tick } from './marks';
import { FAIL_CHIP, type SeamSumCard, type SeamSumWords } from './types';

interface CardProps {
  readonly card: SeamSumCard;
  readonly words: SeamSumWords;
  readonly compact: boolean;
}

/** The card's own goal, ticked; in the compact form the "met" line with its stamp. */
function OwnGoal({ card, words, compact }: CardProps) {
  return (
    <div className={cn('flex gap-1.5', compact ? 'flex-wrap items-center pr-1' : 'items-start')}>
      <Tick label={words.done} />
      <p data-own-goal className={cn('text-caption', compact ? 'text-muted-foreground' : 'leading-snug font-medium')}>
        {words.ownGoal !== undefined && <span className="text-muted-foreground">{words.ownGoal} </span>}
        {card.goal}
      </p>
      {card.stamp !== undefined && (
        <span
          data-stamp
          className="ml-auto -rotate-6 whitespace-nowrap rounded-sm border-2 border-foreground/60 px-1 font-mono text-caption font-medium text-foreground/80"
        >
          {card.stamp}
        </span>
      )}
    </div>
  );
}

/** The failure at the card's seam: the fact, what the other card held, the result and the half it breaks. */
function Failure({ card, words, compact }: CardProps) {
  const { fact, seam, result, breaks } = card.failure;
  return (
    <div className="relative mt-1 flex flex-col gap-1.5 rounded-sm border-2 border-destructive px-2 pt-1.5 pb-2">
      <Cross label={words.fails} />
      <p data-fact className="text-body leading-snug font-semibold break-words hyphens-auto">
        {fact}
      </p>
      <p
        data-seam
        className="flex min-w-0 items-start gap-1 rounded-sm bg-muted px-1.5 py-1 text-caption text-muted-foreground"
      >
        <SeamIcon />
        <span className="min-w-0 break-words hyphens-auto">
          <span className="font-medium text-foreground">{seam.card}:</span> {seam.held}
        </span>
      </p>
      {!compact && result !== undefined && (
        <p data-failure-result className="text-caption font-medium text-destructive">
          {result}
        </p>
      )}
      <span data-breaks className={cn('self-start', FAIL_CHIP)}>
        {words.breaks[breaks]}
      </span>
    </div>
  );
}

/** One card of the sum: its name pill and who did it, the ticked own goal, and its failure at the seam. */
export function SumCard({ tilt, ...props }: CardProps & { readonly tilt: string }) {
  const { card, words, compact } = props;
  return (
    <div
      data-sum-card={card.slug}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex min-w-0 flex-1 flex-col gap-2 rounded-sm bg-card shadow-md',
        compact ? 'p-2.5' : 'p-3',
        tilt,
      )}
    >
      <CardHeader label={card.label} doneBy={{ who: card.doneBy, label: words.doneBy[card.doneBy] }} />
      <OwnGoal {...props} />
      <Failure {...props} />
    </div>
  );
}
