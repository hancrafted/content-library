import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DealBoard, OpenPipeline, type DealLane } from '@/components/slide-shared/deal-board/deal-board';
import { dealCount, pipelineTotal } from '@/components/slide-shared/deal-board/deal-board.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

const GTM_BENCHMARKS = {
  slug: 'ebsta-gtm-benchmarks',
  url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
};

const LANES = 'lanes';

/** The Monday board: five stages, each deal's value in euros; names are invented. */
const BOARD = [
  {
    slug: 'leadIn',
    deals: [
      { slug: 'brightfield', value: 12000 },
      { slug: 'kestrel', value: 8500 },
      { slug: 'larchwood', value: 4000 },
    ],
  },
  {
    slug: 'contactMade',
    deals: [
      { slug: 'orbit', value: 15000 },
      { slug: 'pinecrest', value: 6000 },
    ],
  },
  {
    slug: 'needsDefined',
    deals: [
      { slug: 'quarry', value: 22000 },
      { slug: 'redwood', value: 3500 },
    ],
  },
  {
    slug: 'proposalMade',
    deals: [
      { slug: 'saltmarsh', value: 40000 },
      { slug: 'tidewater', value: 9000 },
    ],
  },
  {
    slug: 'negotiation',
    deals: [
      { slug: 'vela', value: 30000 },
      { slug: 'umbra', value: 18000 },
    ],
  },
] as const;

/**
 * Our own deal board (Spec Option 4a): five stages as lanes, each with its total and count, the deals as paper notes,
 * the open pipeline pinned over the board, and the Proposal made lane ringed as where the week goes, under its
 * annotation.
 */
export const pipelineToolsInPractice = slide({
  slug: 'pipeline-tools-in-practice',
  messages: { en, de },
  notes: [{ slug: 'late-deals-convert-worse', target: LANES, sources: [GTM_BENCHMARKS] }],
  segments: [{ slug: 'one-place-for-every-deal' }, { slug: 'read-it-at-a-glance' }, { slug: 'start-small' }],
  content: ({ t, target, locale }) => {
    const lanes: DealLane[] = BOARD.map((lane) => ({
      slug: lane.slug,
      label: t(`lanes.${lane.slug}.label`),
      deals: lane.deals.map((deal) => ({
        slug: deal.slug,
        company: t(`deals.${deal.slug}.company`),
        contact: t(`deals.${deal.slug}.contact`),
        value: deal.value,
      })),
    }));
    return (
      <SlideFrame className="mt-10 gap-8">
        <div className="self-end">
          <OpenPipeline
            label={t('summary.label')}
            total={pipelineTotal(lanes)}
            deals={t('summary.deals', { count: dealCount(lanes), stages: lanes.length })}
            locale={locale}
          />
        </div>
        <DealBoard
          {...target(LANES)}
          label={t('board')}
          lanes={lanes}
          locale={locale}
          countLabel={(count) => t('lanes.count', { count })}
          emphasis="proposalMade"
          annotation={t('annotation')}
          ends={[t('ends.start'), t('ends.end')]}
        />
      </SlideFrame>
    );
  },
});
