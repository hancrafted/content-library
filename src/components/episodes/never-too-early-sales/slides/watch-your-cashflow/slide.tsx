import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import { CashflowBoard } from '@/components/slide-shared/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Scene, not BasicPageSlide: the board is a grid of notes and cannot sit in its `<p>` prose slot.
export const watchYourCashflow = slide({
  slug: 'watch-your-cashflow',
  messages: { en, de },
  notes: [
    {
      slug: 'costs-start-first',
      target: 'cost-jan',
      sources: [{ slug: 'paul-graham-startup-funding', url: 'https://www.paulgraham.com/startupfunding.html' }],
    },
    {
      slug: 'even-a-signed-deal-waits',
      target: 'march-april-gap',
      sources: [
        {
          slug: 'eu-late-payment-directive',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007',
        },
      ],
    },
  ],
  segments: [{ slug: 'the-board' }, { slug: 'big-deal-lands-in-april' }, { slug: 'find-your-zero-cash-month' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-12">
        <CashflowBoard
          data-target="board"
          label={t('board.label')}
          rowLabels={{ cash: t('board.rows.cash'), cost: t('board.rows.cost'), revenue: t('board.rows.revenue') }}
          months={[
            {
              id: 'jan',
              label: t('board.months.jan'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashJan') },
                { row: 'cost', amount: t('board.amounts.cost'), target: 'cost-jan' },
              ],
            },
            {
              id: 'feb',
              label: t('board.months.feb'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashFeb') },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'mar',
              label: t('board.months.mar'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashMar'), zero: true },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'apr',
              label: t('board.months.apr'),
              notes: [
                { row: 'cost', amount: t('board.amounts.cost') },
                { row: 'revenue', amount: t('board.amounts.revenue') },
              ],
            },
          ]}
          stamp={{ month: 'mar', text: t('board.stamp') }}
          gap={{ after: 'mar', target: 'march-april-gap' }}
        />
      </div>
      <div className="mt-auto pt-10">
        <SlideProse data-target="prose">{t('takeaway')}</SlideProse>
      </div>
    </SlideFrame>
  ),
});
