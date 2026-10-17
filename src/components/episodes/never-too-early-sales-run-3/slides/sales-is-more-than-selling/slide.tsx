import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Brace, MarginNote, Operator } from './equation-parts';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Chips, Exchange, RepeatPath } from './insight-parts';
import { Note } from './note';
import { CheckedChips, SignalBars, Stamp } from './trust-parts';

/** The share of 885 VCs citing each factor, most cited first (Gompers et al., NBER w22587). */
const VC_FACTORS = [
  { slug: 'team', percent: 95 },
  { slug: 'model', percent: 83 },
  { slug: 'product', percent: 74 },
  { slug: 'market', percent: 68 },
] as const;

const MARKET = 'market';
const INTERNAL = 'internal';
const TRUST = 'trust';

/**
 * Sales is more than selling: a sum on a planning board. Market insight plus
 * internal insight equals trust, three taped notes read left to right in the
 * order the voice speaks, with trust in `primary` (Spec Option 2c).
 */
export const salesIsMoreThanSelling = slide({
  slug: 'sales-is-more-than-selling',
  messages: { en, de },
  notes: [
    {
      slug: 'your-starting-model-is-wrong',
      target: MARKET,
      sources: [{ slug: 'graham-do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' }],
    },
    {
      slug: 'ask-about-the-last-time',
      target: MARKET,
      sources: [
        {
          slug: 'yc-how-to-talk-to-users',
          url: 'https://www.ycombinator.com/blog/startup-school-week-1-recap-kevin-hale-and-eric-migicovsky/',
        },
      ],
    },
    {
      slug: 'a-signal-must-be-costly-to-fake',
      target: TRUST,
      sources: [{ slug: 'spence-job-market-signaling', url: 'https://doi.org/10.2307/1882010' }],
    },
    {
      slug: 'investors-read-the-team',
      target: TRUST,
      sources: [{ slug: 'gompers-how-vcs-make-decisions', url: 'https://www.nber.org/papers/w22587' }],
    },
    {
      slug: 'no-study-measures-lois-or-pipelines',
      target: TRUST,
      sources: [{ slug: 'spence-job-market-signaling', url: 'https://doi.org/10.2307/1882010' }],
    },
    {
      slug: 'premature-scaling-burns-cash',
      target: INTERNAL,
      sources: [
        {
          slug: 'blank-it-must-be-a-marketing-problem',
          url: 'https://steveblank.com/2010/02/11/it-must-be-a-marketing-problem/',
        },
      ],
    },
    {
      slug: 'friends-orders-can-mislead',
      target: INTERNAL,
      sources: [
        {
          slug: 'blank-it-must-be-a-marketing-problem',
          url: 'https://steveblank.com/2010/02/11/it-must-be-a-marketing-problem/',
        },
      ],
    },
  ],
  segments: [
    { slug: 'every-talk-is-research' },
    { slug: 'know-how-well-you-sell' },
    { slug: 'trust-is-the-sum' },
    { slug: 'verdict' },
  ],
  content: ({ t, locale, target }) => {
    const marketChips = [
      { label: t('board.market.points.time') },
      { label: t('board.market.dropped'), dropped: true },
      { label: t('board.market.points.network') },
    ];
    const trustChips = [t('board.trust.points.investment'), t('board.trust.points.customers')];
    const barRows = VC_FACTORS.map(({ slug, percent }) => ({ label: t(`board.trust.bars.rows.${slug}`), percent }));
    return (
      <SlideFrame className="gap-10">
        <div className="@container relative flex flex-col gap-6 rounded-xl bg-muted p-6 shadow-inner md:p-10">
          <p className="sr-only">{t('equationLabel')}</p>
          <div className="grid grid-cols-1 items-center gap-4 @4xl:grid-cols-12">
            <Note
              {...target(MARKET)}
              index="01"
              title={t('board.market.title')}
              body={t('board.market.body')}
              tilt="left"
              step={0}
              className="@4xl:col-span-3"
            >
              <Exchange ask={t('board.market.ask')} answer={t('board.market.answer')} />
              <Chips items={marketChips} />
            </Note>
            <Operator symbol="plus" step={1} className="mx-auto w-12 @4xl:col-span-1 @4xl:w-full" />
            <Note
              {...target(INTERNAL)}
              index="02"
              title={t('board.internal.title')}
              body={t('board.internal.body')}
              tilt="right"
              step={2}
              className="@4xl:col-span-3"
            >
              <RepeatPath
                you={t('board.internal.path.you')}
                repeat={t('board.internal.path.repeat')}
                hire={t('board.internal.path.hire')}
                team={t('board.internal.path.team')}
              />
            </Note>
            <Operator symbol="equals" step={3} className="mx-auto w-12 @4xl:col-span-1 @4xl:w-full" />
            <Note
              {...target(TRUST)}
              index="03"
              title={t('board.trust.title')}
              body={t('board.trust.body')}
              tilt="none"
              emphasis
              step={4}
              className="@4xl:col-span-4"
            >
              <Stamp label={t('stamp')} step={6.5} />
              <SignalBars heading={t('board.trust.bars.heading')} rows={barRows} locale={locale} step={5} />
              <CheckedChips items={trustChips} />
            </Note>
          </div>

          <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-12">
            <Brace label={t('brace')} step={7.5} className="hidden @4xl:col-span-7 @4xl:flex" />
            <MarginNote text={t('marginNote')} step={7.5} className="@4xl:col-span-5" />
          </div>
        </div>
        <p className="text-caption text-muted-foreground">{t('source')}</p>
      </SlideFrame>
    );
  },
});
