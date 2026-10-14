import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { formatAmount } from '@/components/slide-shared/board/amount.pure';
import { CashflowBoard, type CashColumn } from '@/components/slide-shared/board/cashflow-board';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import type { Locale } from '@/lib/locale.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './watch-your-cashflow-revenue-pulled-in.module.css';

const CURRENCY = 'USD';

/** The board's seven notes take `--i` 0–6 and its arrow 7; then the move and the ghost, then the "$0" layer. */
const MOVE_STEP = 8;
const ZERO_STEP = 9;

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** An overlay note's amount written as the board writes its own: compact below `sm`, in full from `sm`, revenue signed. */
function Amount({ value, locale, signed = false }: { value: number; locale: Locale; signed?: boolean }) {
  const { full, compact } = formatAmount(value, { currency: CURRENCY, locale, signed });
  return (
    <>
      <span className="sm:hidden">{compact}</span>
      <span className="hidden sm:inline">{full}</span>
    </>
  );
}

/** Sized like a note, dashed: where April's revenue was before it moved. */
const GHOST =
  'col-start-4 row-start-4 flex min-h-14 w-[min(100%-0.5rem,8rem)] items-center justify-center justify-self-center ' +
  'rounded-sm border-2 border-dashed border-border p-1.5 text-center sm:aspect-square';

/*
 * The hook's board returns: the same January to March, but April's million is pulled back two months into
 * February. February's closing cash is no longer $0 but $1,000,000, and nothing is stamped bankrupt. A Scene in
 * place of the basic page, whose paragraph cannot hold a board.
 */
export const watchYourCashflowRevenuePulledIn = slide({
  slug: 'watch-your-cashflow-revenue-pulled-in',
  messages: { en, de },
  notes: [
    {
      slug: 'predicted-revenue-does-not-count',
      target: 'revenue',
      sources: [{ slug: 'default-alive-or-default-dead', url: 'https://paulgraham.com/aord.html' }],
    },
  ],
  segments: [{ slug: 'same-board-earlier-revenue' }, { slug: 'not-more-earlier' }, { slug: 'how-it-moves' }],
  content: ({ t, locale, target, Title }) => {
    const cash = t('board.kinds.cash');
    const cost = t('board.kinds.cost');
    const columns: readonly CashColumn[] = [
      {
        slug: 'january',
        label: t('board.months.january'),
        notes: [
          { slug: 'january-opening', slot: 'opening', label: cash, amount: 100_000 },
          { slug: 'january-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'january-closing', slot: 'closing', label: cash, amount: 50_000 },
        ],
      },
      {
        slug: 'february',
        label: t('board.months.february'),
        notes: [
          { slug: 'february-opening', slot: 'opening', label: cash, amount: 50_000 },
          { slug: 'february-cost', slot: 'cost', label: cost, amount: 50_000 },
          { slug: 'february-closing', slot: 'closing', label: cash, amount: 1_000_000 },
        ],
      },
      {
        slug: 'march',
        label: t('board.months.march'),
        notes: [{ slug: 'march-cost', slot: 'cost', label: cost, amount: 50_000 }],
      },
      { slug: 'april', label: t('board.months.april'), notes: [] },
    ];
    const overlays = (
      <>
        <StickyNote
          tone="revenue"
          primary
          label={t('board.kinds.revenue')}
          value={<Amount value={1_000_000} locale={locale} signed />}
          target={target('revenue')}
          style={step(MOVE_STEP)}
          className={cn('col-start-2 row-start-4', styles.moved)}
        />
        <div role="img" aria-label={t('ghost')} style={step(MOVE_STEP)} className={cn(GHOST, styles.ghost)}>
          <span className="text-caption text-muted-foreground">{t('ghost')}</span>
        </div>
        <div aria-hidden="true" style={step(ZERO_STEP)} className={cn('col-start-2 row-start-5 grid', styles.zero)}>
          <StickyNote tone="warning" primary label={cash} value={<Amount value={0} locale={locale} />} />
        </div>
      </>
    );
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <div className={cn('mt-10', styles.board)}>
          <CashflowBoard
            columns={columns}
            locale={locale}
            currency={CURRENCY}
            arrow={{ from: 4, to: 2, slot: 'revenue' }}
            arrowClassName={cn(styles.arrow, 'text-primary')}
            overlays={overlays}
          />
        </div>
      </SlideFrame>
    );
  },
});
