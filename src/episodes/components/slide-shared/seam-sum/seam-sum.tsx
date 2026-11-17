import { cn } from '@/shared/lib/utils';
import { Cross } from './marks';
import { SumCard } from './sum-card';
import { tiltOf } from './tilt.pure';
import { FAIL_CHIP, type SeamSumProps } from './types';

export type { Half, SeamSumCard } from './types';

// decision: FE-007 §5
const SIGN = 'self-center text-subheading font-semibold text-muted-foreground';

function CardRow({ cards, words, compact }: Pick<SeamSumProps, 'cards' | 'words'> & { compact: boolean }) {
  return (
    <ul
      aria-label={words.cards}
      className={cn(
        'focus-group focus-group--dim-others flex flex-col items-stretch px-1',
        compact ? 'gap-1 @2xl:flex-row' : 'gap-2 @3xl:flex-row',
      )}
    >
      {cards.map((card, index) => (
        <li
          key={card.slug}
          className={cn(
            'flex min-w-0 flex-1 basis-0 flex-col items-stretch gap-1',
            compact ? '@2xl:flex-row @2xl:gap-1' : '@3xl:flex-row @3xl:gap-2',
          )}
        >
          {index > 0 && (
            <span data-plus aria-hidden className={SIGN}>
              +
            </span>
          )}
          <SumCard card={card} words={words} compact={compact} tilt={tiltOf(index)} />
        </li>
      ))}
    </ul>
  );
}

function SumResult({ result, words }: Pick<SeamSumProps, 'result' | 'words'>) {
  return (
    <div className="flex items-center gap-4 px-1">
      <span aria-hidden className={SIGN}>
        =
      </span>
      <div
        data-sum-result
        className="relative flex flex-1 rotate-1 flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border-2 border-destructive bg-card px-4 py-3 shadow-xl"
      >
        <Cross label={words.fails} />
        <p data-result-title className="text-body font-semibold">
          {result.title}
        </p>
        <p data-result-goal className="text-caption text-muted-foreground">
          {result.goal}
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {result.broken.map(({ half, by }) => (
            <li key={half} data-broken={half} className="flex items-center gap-2">
              <span className={FAIL_CHIP}>✗ {words.halves[half]}</span>{' '}
              <span className="text-caption text-muted-foreground">{by}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SeamSum({ label, cards, result, words, compact = false }: SeamSumProps) {
  return (
    <div
      data-seam-sum
      className={cn('@container flex flex-col gap-4 rounded-xl bg-muted shadow-inner', compact ? 'p-3' : 'p-4')}
    >
      <p data-sum-label className="flex flex-wrap items-center gap-x-1.5 text-caption text-muted-foreground">
        <span className="font-medium text-foreground">{label.name}</span> <span aria-hidden>·</span>{' '}
        <span>{label.detail}</span>
        {label.marker}
      </p>
      <CardRow cards={cards} words={words} compact={compact} />
      <SumResult result={result} words={words} />
    </div>
  );
}
