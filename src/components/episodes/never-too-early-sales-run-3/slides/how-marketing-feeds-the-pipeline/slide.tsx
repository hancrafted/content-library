import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DealBoard, type DealLane } from '@/components/slide-shared/deal-board/deal-board';
import styles from './how-marketing-feeds-the-pipeline.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MarketingFunnel } from './marketing-funnel';

const DO_THINGS_THAT_DONT_SCALE = { slug: 'graham-do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' };
const GTM_BENCHMARKS = {
  slug: 'ebsta-gtm-benchmarks',
  url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
};

const LEAD_IN = 'lead-in';

/** The compact pipeline: Lead in takes what marketing sends; the other stages hold invented companies. */
const PIPELINE = [
  { slug: 'leadIn', deals: [] },
  { slug: 'contact', deals: ['orbit', 'pinecrest'] },
  { slug: 'needs', deals: ['quarry', 'redwood'] },
  { slug: 'proposal', deals: ['saltmarsh'] },
  { slug: 'negotiation', deals: ['vela'] },
] as const;

/** What lands in Lead in on its own: an inbound form, an online checkout, a booked demo. */
const INCOMING = ['form', 'checkout', 'demo'] as const;

const SOURCES = ['content', 'ads', 'web'] as const;

/**
 * How marketing feeds the pipeline (Spec Option 5a): a funnel of our own drawing narrows from three marketing notes
 * into the ringed Lead in lane of the compact deal board, where the inbound examples sit; a bracket under the other
 * lanes says sales works what lands there. While the Slide is active the dots travel the funnel one at a time, then
 * the Lead in notes are placed.
 */
export const howMarketingFeedsThePipeline = slide({
  slug: 'how-marketing-feeds-the-pipeline',
  messages: { en, de },
  notes: [
    { slug: 'customers-do-not-arrive-alone', target: 'title', sources: [DO_THINGS_THAT_DONT_SCALE] },
    { slug: 'the-marketing-hand-off-has-its-own-rate', target: LEAD_IN, sources: [GTM_BENCHMARKS] },
  ],
  segments: [{ slug: 'two-ways-in' }, { slug: 'volume-into-a-defined-stage' }, { slug: 'hand-to-sales' }],
  content: ({ t, target, locale }) => {
    const lanes: DealLane[] = PIPELINE.map((lane) => ({
      slug: lane.slug,
      label: t(`lanes.${lane.slug}.short`),
      deals: lane.deals.map((slug) => ({ slug, company: t(`deals.${slug}`) })),
    }));
    return (
      <SlideFrame className={`${styles.scene} gap-10`}>
        <div className={styles.layout}>
          <MarketingFunnel
            funnel={{
              label: t('marketing'),
              volume: t('volume'),
              sources: SOURCES.map((slug) => ({ slug, label: t(`sources.${slug}`) })),
            }}
          />
          <DealBoard
            label={t('board')}
            lanes={lanes}
            locale={locale}
            compact
            emphasis="leadIn"
            emphasisTarget={target(LEAD_IN)['data-target']}
            incoming={INCOMING.map((slug) => ({
              slug,
              tag: t(`incoming.${slug}.tag`),
              text: t(`incoming.${slug}.text`),
            }))}
            bracket={{ stage: t('stage'), label: t('handOff'), from: 2, to: PIPELINE.length }}
          />
        </div>
      </SlideFrame>
    );
  },
});
