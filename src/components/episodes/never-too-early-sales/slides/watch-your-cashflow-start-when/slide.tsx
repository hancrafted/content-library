import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard } from '@/components/slide-shared/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { StartSteps } from './start-steps';

const STEPS = ['zero-cash-month', 'customer-list', 'first-contact', 'deal-board'] as const;

// A Scene, not BasicPageSlide: the board and the steps list cannot sit in its `<p>` prose slot.
// The board's last return, by quarter: it asks "Start when?", and the steps column answers.
export const watchYourCashflowStartWhen = slide({
  slug: 'watch-your-cashflow-start-when',
  messages: { en, de },
  notes: [
    {
      slug: 'worrying-early-is-cheap',
      target: 'arrow',
      sources: [{ slug: 'default-alive', url: 'https://paulgraham.com/aord.html' }],
    },
  ],
  segments: [{ slug: 'revenue-lags-costs' }, { slug: 'start-now' }, { slug: 'four-steps' }, { slug: 'this-week' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] lg:items-start">
        <CashflowBoard
          data-target="board"
          label={t('board.label')}
          rowLabels={{ cash: t('board.rows.cash'), cost: t('board.rows.cost'), revenue: t('board.rows.revenue') }}
          months={[
            {
              id: 'q1',
              label: t('board.months.q1'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashQ1') },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'q2',
              label: t('board.months.q2'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashQ2'), zero: true },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'q3',
              label: t('board.months.q3'),
              notes: [
                { row: 'cost', amount: t('board.amounts.cost') },
                { row: 'revenue', amount: t('board.amounts.revenue') },
              ],
            },
            {
              id: 'q4',
              label: t('board.months.q4'),
              notes: [
                { row: 'cost', amount: t('board.amounts.cost') },
                { row: 'revenue', amount: t('board.amounts.revenue') },
              ],
            },
          ]}
          arrow={{ from: 'q3', to: 'q1', label: t('board.arrow'), target: 'arrow' }}
        />
        <StartSteps
          heading={t('steps.heading')}
          steps={STEPS.map((slug) => ({ slug, text: t(`steps.items.${slug}`) }))}
          footer={t('steps.footer')}
        />
      </div>
    </SlideFrame>
  ),
});
