import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MonthStrip } from './month-strip';
import { NoteFunnel } from './note-funnel';

// A Scene on `@container`: every layout switch reads the Foreground width, never the viewport.
export const pipelineByTheNumbers = slide({
  slug: 'pipeline-by-the-numbers',
  messages: { en, de },
  notes: [
    {
      slug: 'a-real-dataset-other-numbers',
      target: 'total-ratio',
      sources: [
        {
          slug: 'ebsta-pavilion-gtm-benchmarks',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
    {
      slug: 'the-biggest-loss-is-no-decision',
      target: 'funnel',
      sources: [
        { slug: 'hbr-customer-indecision', url: 'https://hbr.org/2022/06/stop-losing-sales-to-customer-indecision' },
      ],
    },
    {
      slug: 'why-cycles-are-long',
      target: 'durations',
      sources: [{ slug: 'hbr-consensus-sale', url: 'https://hbr.org/2015/03/making-the-consensus-sale' }],
    },
  ],
  segments: [
    { slug: 'walk-the-funnel' },
    { slug: 'fill-it-with-many' },
    { slug: 'time-adds-up' },
    { slug: 'illustration-only' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame className="@container">
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-10">
        <NoteFunnel
          {...target('funnel')}
          totalTarget={target('total-ratio')['data-target']}
          stages={[
            { label: t('stages.lead.label'), count: 27, countLabel: t('stages.lead.note') },
            { label: t('stages.opportunity.label'), count: 9, countLabel: t('stages.opportunity.note') },
            { label: t('stages.deal.label'), count: 1, countLabel: t('stages.deal.note') },
          ]}
          ratios={[t('ratios.leadToOpportunity'), t('ratios.opportunityToDeal')]}
          total={t('ratios.total')}
        />
      </div>
      <div className="mt-12">
        <MonthStrip
          {...target('durations')}
          bars={[
            { label: t('durations.lead'), startHalf: 0, spanHalves: 1 },
            { label: t('durations.opportunity'), startHalf: 1, spanHalves: 12 },
            { label: t('durations.deal'), startHalf: 13, spanHalves: 6 },
          ]}
          axisLabel={t('timeline.axis')}
          totalLabel={t('durations.total')}
          revenueLabel={t('timeline.revenue')}
        />
      </div>
      {/* At rest, in every frame and width: never animated, never hover. */}
      <p className="mt-6 inline-flex w-fit rounded-sm border border-dashed border-border px-2 py-1 text-caption text-muted-foreground">
        {t('illustration')}
      </p>
    </SlideFrame>
  ),
});
