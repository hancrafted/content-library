import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DealBoard } from '@/components/slide-shared/deal-board/deal-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { EntryArrow, MarketingFunnel } from './marketing-funnel';

// A Scene, not BasicPageSlide: a funnel beside a board cannot sit in its `<p>` prose slot. The dots fall once: the spec allows no loops.
export const howMarketingFeedsThePipeline = slide({
  slug: 'how-marketing-feeds-the-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'rates-differ-per-stage',
      target: 'entry-stage',
      sources: [
        {
          slug: 'ebsta-pavilion-gtm-benchmarks',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'marketing-adds-volume' }, { slug: 'defined-entry-point' }, { slug: 'not-a-substitute' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      {/* The row is keyed on the Scene's own width (`@4xl`): beside the table of contents a `md` page leaves too little room. */}
      <div className="@container mt-auto pt-10">
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,3fr)] @4xl:items-center">
          <MarketingFunnel title={t('funnel.title')} channels={t('funnel.channels')} label={t('funnel.label')} />
          <EntryArrow label={t('entry')} />
          <DealBoard
            label={t('board.label')}
            highlight="new"
            columns={[
              {
                slug: 'new',
                title: t('board.columns.new.title'),
                target: target('entry-stage'),
                summary: t('board.columns.new.summary'),
                cards: [
                  {
                    slug: 'brightfold',
                    name: t('board.cards.brightfold.name'),
                    value: t('board.cards.brightfold.value'),
                  },
                  {
                    slug: 'okapi-logistics',
                    name: t('board.cards.okapi-logistics.name'),
                    value: t('board.cards.okapi-logistics.value'),
                  },
                  {
                    slug: 'talvik-energy',
                    name: t('board.cards.talvik-energy.name'),
                    value: t('board.cards.talvik-energy.value'),
                  },
                ],
              },
              {
                slug: 'meeting',
                title: t('board.columns.meeting.title'),
                summary: t('board.columns.meeting.summary'),
                cards: [
                  {
                    slug: 'mosswell-clinics',
                    name: t('board.cards.mosswell-clinics.name'),
                    value: t('board.cards.mosswell-clinics.value'),
                  },
                ],
              },
              {
                slug: 'proposal',
                title: t('board.columns.proposal.title'),
                summary: t('board.columns.proposal.summary'),
                cards: [
                  {
                    slug: 'kestrel-labs',
                    name: t('board.cards.kestrel-labs.name'),
                    value: t('board.cards.kestrel-labs.value'),
                  },
                  {
                    slug: 'harbor-and-pine',
                    name: t('board.cards.harbor-and-pine.name'),
                    value: t('board.cards.harbor-and-pine.value'),
                  },
                ],
              },
              {
                slug: 'won',
                title: t('board.columns.won.title'),
                summary: t('board.columns.won.summary'),
                cards: [
                  {
                    slug: 'lindgren-tools',
                    name: t('board.cards.lindgren-tools.name'),
                    value: t('board.cards.lindgren-tools.value'),
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    </SlideFrame>
  ),
});
