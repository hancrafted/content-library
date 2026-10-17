import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { CountBoard } from './count-board';
import { cycleBar, formatEuro, PIPELINE, totalConversion } from './count-board.pure';
import { CycleBar } from './cycle-bar';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './pipeline-by-the-numbers.module.css';

/** The 27 lead notes, in board order. */
const LEADS = [
  'kraus',
  'novak',
  'hahn',
  'okafor',
  'lind',
  'meyer',
  'santos',
  'petrov',
  'weber',
  'dubois',
  'haas',
  'larsen',
  'moretti',
  'fischer',
  'ito',
  'becker',
  'nowak',
  'schulz',
  'rossi',
  'keller',
  'varga',
  'bauer',
  'jansen',
  'wolf',
  'costa',
  'sato',
  'ahmed',
] as const;

/** The nine leads that became opportunities, each at the step it has reached. */
const OPPORTUNITIES = [
  ['kraus', 'demo'],
  ['novak', 'proposal'],
  ['weber', 'pricing'],
  ['haas', 'demo'],
  ['fischer', 'legal'],
  ['nowak', 'proposal'],
  ['keller', 'demo'],
  ['bauer', 'pricing'],
  ['sato', 'demo'],
] as const;

/** The one signed deal, in whole euros. */
const DEAL_AMOUNT = 12_000;

/*
 * The worked example counted on the board (Option 8b): 27 named lead notes, nine in Opportunity and one revenue note
 * in Deal, under the primary 27:1 bracket, with the cycle bar drawn to scale beneath. The Slide header above, the
 * body a Scene in `SlideFrame`; every number comes from the `PIPELINE` table.
 */
export const pipelineByTheNumbers = slide({
  slug: 'pipeline-by-the-numbers',
  messages: { en, de },
  notes: [
    {
      slug: 'a-reference-win-rate',
      target: 'title',
      sources: [
        {
          slug: 'ebsta-pavilion',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
    {
      slug: 'the-biggest-loss-is-no-decision',
      target: 'ratio-opp-deal',
      sources: [{ slug: 'hbr-indecision', url: 'https://hbr.org/2022/06/stop-losing-sales-to-customer-indecision' }],
    },
    {
      slug: 'everyone-holds-a-veto',
      target: 'opportunity',
      sources: [{ slug: 'hbr-consensus-sale', url: 'https://hbr.org/2015/03/making-the-consensus-sale' }],
    },
    {
      slug: 'buying-groups-disagree',
      target: 'opportunity',
      sources: [
        {
          slug: 'gartner-buyer-teams',
          url: 'https://www.gartner.com/en/newsroom/press-releases/2025-05-07-gartner-sales-survey-finds-74-percent-of-b2b-buyer-teams-demonstrate-unhealthy-conflict-during-the-decision-process',
        },
      ],
    },
  ],
  segments: [
    { slug: 'read-the-picture' },
    { slug: 'read-the-clock' },
    { slug: 'backward-chain' },
    { slug: 'your-numbers-not-mine' },
  ],
  content: ({ t, locale, target, marker, Marker }) => {
    const [lead, opportunity, deal] = PIPELINE;
    const total = totalConversion(PIPELINE);
    const bar = cycleBar(PIPELINE);
    return (
      <SlideFrame className={`${styles.scene} mt-10`}>
        <div className="flex flex-col gap-6">
          <CountBoard
            stages={[
              {
                id: 'lead',
                label: t('stages.lead', { count: lead.notes }),
                duration: t('durations.lead'),
                ratioToNext: t('ratios.leadOpp', { ratio: lead.ratioToNext }),
                notes: LEADS.map((name) => ({ name: t(`names.${name}`) })),
              },
              {
                id: 'opportunity',
                label: t('stages.opportunity', { count: opportunity.notes }),
                duration: t('durations.opportunity'),
                ratioToNext: t('ratios.oppDeal', { ratio: opportunity.ratioToNext }),
                ratioMarker: <Marker note="the-biggest-loss-is-no-decision" className="static" />,
                markers: (
                  <>
                    <Marker note="everyone-holds-a-veto" className="static" />
                    <Marker note="buying-groups-disagree" className="static" />
                  </>
                ),
                notes: OPPORTUNITIES.map(([name, state]) => ({
                  name: t(`names.${name}`),
                  state: t(`states.${state}`),
                })),
              },
              {
                id: 'deal',
                label: t('stages.deal', { count: deal.notes }),
                duration: t('durations.deal'),
                notes: [{ name: t('names.novak'), state: t('states.signed'), amount: formatEuro(DEAL_AMOUNT, locale) }],
              },
            ]}
            total={{
              ratio: t('total', { total }),
              caption: t.rich('totalCaption', { total, marker: marker('a-reference-win-rate') }),
            }}
            others={t('others', { count: opportunity.notes - deal.notes })}
            targets={{ opportunity: target('opportunity'), ratioOppDeal: target('ratio-opp-deal') }}
          />
          <CycleBar
            total={t('cycle.total', { months: bar.months })}
            months={bar.months}
            ticks={bar.ticks}
            segments={bar.segments.map((segment) => ({ ...segment, label: t(`cycle.${segment.id}`) }))}
          />
        </div>
      </SlideFrame>
    );
  },
});
