import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneBoard } from './day-one-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * The founder's board on day one (Option 9b): preparation not written yet, an unknown market, and the two metrics
 * still "?", stamped "Day one". A Scene from `SlideFrame` under the Slide header.
 */
export const whyItTakesTimeToRampUp = slide({
  slug: 'why-it-takes-time-to-ramp-up',
  messages: { en, de },
  notes: [
    {
      slug: 'startups-search-they-do-not-execute',
      target: 'market',
      sources: [{ slug: 'blank-manifesto', url: 'https://steveblank.com/category/customer-development-manifesto/' }],
    },
    {
      slug: 'selling-blind',
      target: 'market',
      sources: [
        { slug: 'blank-marketing-problem', url: 'https://steveblank.com/2010/02/11/it-must-be-a-marketing-problem/' },
      ],
    },
    {
      slug: 'learn-first-codify-later',
      target: 'preparation',
      sources: [
        {
          slug: 'roberge-science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
    {
      slug: 'metrics-lag-by-one-cycle',
      target: 'metrics',
      sources: [
        {
          slug: 'roberge-science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
  ],
  segments: [
    { slug: 'preparation' },
    { slug: 'unknown-market' },
    { slug: 'unknown-metrics' },
    { slug: 'so-start-now' },
  ],
  content: ({ t, target }) => (
    <SlideFrame>
      <DayOneBoard
        stamp={t('stamp')}
        columns={{
          preparation: t('lanes.preparation'),
          market: t('lanes.market'),
          metrics: t('lanes.metrics'),
        }}
        preparation={[
          { id: 'before', label: t('preparation.before.label'), items: t('preparation.before.items') },
          { id: 'during', label: t('preparation.during.label'), items: t('preparation.during.items') },
          { id: 'deal', label: t('preparation.deal.label'), items: t('preparation.deal.items') },
        ]}
        questions={[t('market.q1'), t('market.q2'), t('market.q3')]}
        metrics={[
          { label: t('metrics.conversion.label'), unknown: t('metrics.conversion.unknown') },
          { label: t('metrics.cycle.label'), unknown: t('metrics.cycle.unknown') },
        ]}
        hints={{ preparation: t('preparation.hint'), market: t('market.hint'), metrics: t('metrics.why') }}
        close={t.rich('close')}
        targets={{ preparation: target('preparation'), market: target('market'), metrics: target('metrics') }}
      />
    </SlideFrame>
  ),
});
