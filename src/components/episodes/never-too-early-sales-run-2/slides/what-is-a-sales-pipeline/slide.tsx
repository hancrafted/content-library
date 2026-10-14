import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board } from '@/components/slide-shared/board/board';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import type { CSSProperties } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './what-is-a-sales-pipeline.module.css';

/*
 * The three numbers that describe a pipeline, as three notes on the board in reading order: the funnel (volume per
 * stage, the one to look at), the conversion rate and the sales cycle. A Scene in place of the Dossier's basic page
 * (the ticket's overrule of grid-1x3): the notes sit on a board, and the definitions live in the Voice script.
 */
export const whatIsASalesPipeline = slide({
  slug: 'what-is-a-sales-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'rates-differ-per-stage',
      target: 'conversion-rate',
      sources: [
        {
          slug: 'ebsta-pavilion',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
  ],
  segments: [
    { slug: 'funnel' },
    { slug: 'conversion-rate' },
    { slug: 'sales-cycle' },
    { slug: 'fourth-actionable-measure' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <Board aria-label={t('title')} className="mt-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <StickyNote
            tone="neutral"
            primary
            fill
            label={t('board.funnel.label')}
            className={styles.note}
            style={{ '--i': 0 } as CSSProperties}
          >
            <p>{t('board.funnel.line')}</p>
          </StickyNote>
          <StickyNote
            tone="neutral"
            fill
            label={t('board.conversionRate.label')}
            target={target('conversion-rate')}
            className={styles.note}
            style={{ '--i': 1 } as CSSProperties}
          >
            <p>{t('board.conversionRate.line')}</p>
          </StickyNote>
          <StickyNote
            tone="neutral"
            fill
            label={t('board.salesCycle.label')}
            className={styles.note}
            style={{ '--i': 2 } as CSSProperties}
          >
            <p>{t('board.salesCycle.line')}</p>
          </StickyNote>
        </div>
      </Board>
    </SlideFrame>
  ),
});
