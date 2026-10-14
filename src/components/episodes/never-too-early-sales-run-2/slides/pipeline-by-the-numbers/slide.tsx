import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board } from '@/components/slide-shared/board/board';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import type { CSSProperties } from 'react';
import { Cycle } from './cycle';
import { Funnel } from './funnel';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './pipeline-by-the-numbers.module.css';

const EBSTA_PAVILION = {
  slug: 'ebsta-pavilion',
  url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
};

/*
 * The arithmetic of a complex sale, drawn: three stages narrowing like a funnel, the 3 : 1 and 9 : 1 ratios on the
 * joins multiplying to 27 : 1, and a bar under it proportional to time, so 6 months dominates and the 9.5-month
 * total is the one thing to look at. Labelled an illustration; a note with one measured dataset sits beside it.
 */
export const pipelineByTheNumbers = slide({
  slug: 'pipeline-by-the-numbers',
  messages: { en, de },
  notes: [
    { slug: 'measured-one-dataset', target: 'measured', sources: [EBSTA_PAVILION] },
    {
      slug: 'most-losses-are-no-decision',
      target: 'title',
      sources: [{ slug: 'hbr-indecision', url: 'https://hbr.org/2022/06/stop-losing-sales-to-customer-indecision' }],
    },
    {
      slug: 'the-buyer-is-a-group',
      target: 'title',
      sources: [
        {
          slug: 'gartner-buyer-teams',
          url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-07-gartner-sales-survey-finds-74-percent-of-b2b-buyer-teams-demonstrate-unhealthy-conflict-during-the-decision-process',
        },
      ],
    },
  ],
  segments: [
    { slug: 'illustration' },
    { slug: 'ratios-multiply' },
    { slug: 'time-adds-up' },
    { slug: 'measured-sits-beside-it' },
    { slug: 'so-fill-early' },
  ],
  content: ({ t, target, Title }) => {
    const lead = t('stages.lead');
    const opportunity = t('stages.opportunity');
    const deal = t('stages.deal');
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption>{t('caption')}</SlideCaption>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_16rem] lg:items-start">
          <Board aria-label={t('title')} className="min-w-0">
            <p className="text-caption text-muted-foreground">{t('illustration')}</p>
            <Funnel
              stages={[
                { slug: 'lead', label: lead },
                { slug: 'opportunity', label: opportunity },
                { slug: 'deal', label: deal },
              ]}
              ratios={[
                { label: `${lead} → ${opportunity}`, value: t('ratios.leadToOpportunity') },
                { label: `${opportunity} → ${deal}`, value: t('ratios.opportunityToDeal') },
              ]}
              total={t('ratios.total')}
              noteClassName={styles.note}
              arrowClassName={styles.arrow}
              bandClassName={styles.band}
            />
            <Cycle
              durations={[
                { slug: 'lead', label: t('durations.lead') },
                { slug: 'opportunity', label: t('durations.opportunity') },
                { slug: 'deal', label: t('durations.deal') },
              ]}
              total={t('durations.total')}
              segmentClassName={styles.segment}
              totalClassName={styles.total}
            />
          </Board>
          <StickyNote
            tone="neutral"
            fill
            label={t('measured.label')}
            target={target('measured')}
            className={styles.note}
            style={{ '--i': 9 } as CSSProperties}
          >
            <ul className="flex flex-col gap-1">
              <li>{t('measured.winRate')}</li>
              <li>{t('measured.cycle')}</li>
            </ul>
          </StickyNote>
        </div>
      </SlideFrame>
    );
  },
});
