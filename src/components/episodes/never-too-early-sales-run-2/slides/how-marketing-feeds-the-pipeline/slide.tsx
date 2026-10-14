import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board, type BoardColumnProps } from '@/components/slide-shared/board/board';
import { BoardArrow } from '@/components/slide-shared/board/board-arrow';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './how-marketing-feeds-the-pipeline.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MarketingFunnel } from './marketing-funnel';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** Three inbound leads, then the arrow: their reading order. */
const LEADS = ['first', 'second', 'third'] as const;
const ARROW_STEP = LEADS.length;

/** The stages marketing does not reach: dashed and empty. */
const UNREACHED = ['contact-made', 'needs-defined', 'proposal-made', 'negotiations-started'] as const;

/*
 * The arrow sits on the board's first row, so from `md` the columns are pinned to their own tracks too: grid
 * auto-placement would otherwise skip the cells the arrow holds and push the columns down a row.
 */
/*
 * The arrow runs from Lead in's edge across the gap and the empty Contact made column, so its label pill sits over
 * that empty column and never over a lead note.
 */
const PIN_COLUMNS =
  'md:[&>[data-board-column]]:row-start-1 md:[&>[data-board-column]:nth-child(1)]:col-start-1 ' +
  'md:[&>[data-board-column]:nth-child(2)]:col-start-2 md:[&>[data-board-column]:nth-child(3)]:col-start-3 ' +
  'md:[&>[data-board-column]:nth-child(4)]:col-start-4 md:[&>[data-board-column]:nth-child(5)]:col-start-5';

/*
 * Marketing as our own drawn funnel over the deal board: many in at the top, a few inbound leads out of the spout
 * into Lead in, the one stage marketing fills; sales takes it from there. A Scene in place of the basic page, whose
 * paragraph cannot hold a board.
 */
export const howMarketingFeedsThePipeline = slide({
  slug: 'how-marketing-feeds-the-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'customers-do-not-arrive-on-their-own',
      target: 'funnel',
      sources: [{ slug: 'do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' }],
    },
  ],
  segments: [{ slug: 'volume' }, { slug: 'enter-a-defined-stage' }, { slug: 'you-do-not-need-it-first' }],
  content: ({ t, target, Title }) => {
    const columns: readonly BoardColumnProps[] = [
      {
        slug: 'lead-in',
        label: t('board.columns.lead-in'),
        primary: true,
        children: LEADS.map((lead, i) => (
          <StickyNote
            key={lead}
            tone="neutral"
            label={t('lead')}
            style={step(i)}
            className={cn(styles.note, styles.fall)}
          />
        )),
      },
      ...UNREACHED.map((slug) => ({ slug, label: t(`board.columns.${slug}`), dashed: true })),
    ];
    const arrow = (
      <BoardArrow
        direction="right"
        label={t('salesContact')}
        style={step(ARROW_STEP)}
        className={cn(
          styles.arrow,
          'hidden md:flex col-start-2 row-start-1 -ml-(--board-gap) self-center text-foreground',
        )}
      />
    );
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div className="mt-10">
          <MarketingFunnel label={t('funnel')} target={target('funnel')} />
          <Board
            columns={columns}
            overlay={arrow}
            aria-label={t('figure')}
            className={cn('[--columns:1] md:[--columns:5]', PIN_COLUMNS)}
          />
        </div>
      </SlideFrame>
    );
  },
});
