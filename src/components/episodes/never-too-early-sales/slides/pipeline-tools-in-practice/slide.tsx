import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DealBoard } from '@/components/slide-shared/deal-board/deal-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Scene, not BasicPageSlide: a deal board of columns and cards cannot sit in its `<p>` prose slot.
export const pipelineToolsInPractice = slide({
  slug: 'pipeline-tools-in-practice',
  messages: { en, de },
  notes: [
    {
      slug: 'late-slippage-hurts',
      target: 'proposal-card',
      sources: [
        {
          slug: 'ebsta-pavilion-gtm-benchmarks',
          url: 'https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'simple-board' }, { slug: 'track-every-deal' }, { slug: 'start-simple' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto pt-10">
        <DealBoard
          label={t('board.label')}
          moved={{ card: 'harbor-and-pine', from: 'meeting' }}
          columns={[
            {
              slug: 'new',
              title: t('board.columns.new.title'),
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
                  target: target('proposal-card'),
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
    </SlideFrame>
  ),
});
