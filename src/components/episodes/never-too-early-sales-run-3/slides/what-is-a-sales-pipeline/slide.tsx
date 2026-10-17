import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PipelineBoard } from './pipeline-board';
import styles from './what-is-a-sales-pipeline.module.css';

/** The one signed deal on the board, in whole euros. */
const DEAL_AMOUNT = 12_000;

/*
 * Funnel, conversion rate and sales cycle as three readings of one drawn pipeline board (Option 7b): the lanes are the
 * funnel, the primary bracket over Lead and Opportunity is the conversion rate, and the arrow under the board is the
 * cycle. A Scene from `SlideFrame` under the Slide header.
 */
export const whatIsASalesPipeline = slide({
  slug: 'what-is-a-sales-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'stage-rates-are-not-portable',
      target: 'conversion',
      sources: [
        {
          slug: 'ebsta-pavilion',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
    {
      slug: 'cycle-length-hits-cash',
      target: 'cycle',
      sources: [
        {
          slug: 'roberge-science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'funnel-is-volume' }, { slug: 'conversion-is-the-offer' }, { slug: 'cycle-is-efficiency' }],
  content: ({ t, locale, target }) => (
    <SlideFrame className={`${styles.scene} mt-10`}>
      <PipelineBoard
        stages={[
          {
            id: 'lead',
            label: t('stages.lead'),
            span: 5,
            notes: [
              { name: t('cards.kraus') },
              { name: t('cards.novak') },
              { name: t('cards.hofmann') },
              { name: t('cards.brightline') },
              { name: t('cards.okafor') },
              { name: t('cards.lindqvist') },
            ],
          },
          {
            id: 'opportunity',
            label: t('stages.opportunity'),
            span: 4,
            notes: [
              { name: t('cards.kraus'), state: t('cards.demoBooked') },
              { name: t('cards.novak'), state: t('cards.proposalSent') },
            ],
          },
          {
            id: 'deal',
            label: t('stages.deal'),
            span: 3,
            notes: [
              {
                name: t('cards.novak'),
                state: t('cards.signed'),
                amount: new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(DEAL_AMOUNT),
              },
            ],
          },
        ]}
        conversion={{
          label: t('terms.conversion.label'),
          ratio: t('ratio'),
          caption: t.rich('terms.conversion.caption'),
          target: target('conversion'),
        }}
        funnel={{
          label: t('terms.funnel.label'),
          caption: t.rich('terms.funnel.caption'),
        }}
        cycle={{ caption: t.rich('terms.cycle'), target: target('cycle') }}
      />
    </SlideFrame>
  ),
});
