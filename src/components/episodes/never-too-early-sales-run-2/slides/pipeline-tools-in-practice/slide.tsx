import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board, type BoardColumnProps } from '@/components/slide-shared/board/board';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import { DEALS, dealColumns } from './deal-board.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './pipeline-tools-in-practice.module.css';

/** One stage per row on a phone, three from `md`, all five from `lg`. */
const REFLOW = '[--columns:1] md:[--columns:3] lg:[--columns:5]';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** Reading order: every note column by column, then the ghost, then the move. */
const GHOST_STEP = DEALS.length;
const MOVE_STEP = DEALS.length + 1;

/*
 * Our own drawn deal board: five stages, one note per deal with its company and value, the column's total and deal
 * count on top. Nordwerk has just moved from Needs defined to Proposal made, and a dashed ghost marks where it came
 * from. A Scene in place of the basic page, whose paragraph cannot hold a board. Fictional companies only.
 */
export const pipelineToolsInPractice = slide({
  slug: 'pipeline-tools-in-practice',
  messages: { en, de },
  notes: [
    {
      slug: 'slipping-deals-convert-worse',
      target: 'moving-deal',
      sources: [
        {
          slug: 'gtm-benchmarks',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'one-board-for-all-deals' }, { slug: 'fourth-actionable-track-deals' }, { slug: 'move-or-drop' }],
  content: ({ t, locale, target, Title }) => {
    let next = 0;
    const columns: readonly BoardColumnProps[] = dealColumns(DEALS, locale).map((view) => ({
      slug: view.column,
      label: t(`board.columns.${view.column}`),
      children: (
        <>
          <p className="text-caption text-muted-foreground tabular-nums">
            {t('total', { amount: view.totalText, count: view.count })}
          </p>
          {view.column === 'needs-defined' && (
            <div
              role="img"
              aria-label={t('ghost')}
              style={step(GHOST_STEP)}
              className={cn(
                styles.ghost,
                'min-h-14 w-[min(100%-0.5rem,8rem)] self-center justify-self-center rounded-sm border-2 border-dashed border-border sm:aspect-square',
              )}
            />
          )}
          {view.deals.map((deal) => {
            const i = next++;
            return deal.moved ? (
              <StickyNote
                key={deal.slug}
                tone="neutral"
                primary
                label={deal.company}
                value={deal.amountText}
                target={target('moving-deal')}
                style={step(MOVE_STEP)}
                className={styles.moved}
              />
            ) : (
              <StickyNote
                key={deal.slug}
                tone="neutral"
                label={deal.company}
                value={deal.amountText}
                style={step(i)}
                className={styles.note}
              />
            );
          })}
        </>
      ),
    }));
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <div className={cn('mt-10', styles.board)}>
          <Board columns={columns} aria-label={t('figure')} className={REFLOW} />
        </div>
      </SlideFrame>
    );
  },
});
