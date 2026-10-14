import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { CashflowBoard } from '@/components/slide-shared/cashflow-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A Scene, not BasicPageSlide: the returning board keeps the first board's grid, which only the shared part guarantees.
export const watchYourCashflowRevenuePulledIn = slide({
  slug: 'watch-your-cashflow-revenue-pulled-in',
  messages: { en, de },
  notes: [
    {
      slug: 'promised-revenue-is-discounted',
      target: 'revenue-note',
      sources: [{ slug: 'paul-graham-default-alive', url: 'https://paulgraham.com/aord.html' }],
    },
  ],
  segments: [{ slug: 'same-board' }, { slug: 'revenue-earlier' }, { slug: 'how-it-moves' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-12">
        <CashflowBoard
          label={t('board.label')}
          rowLabels={{ cash: t('board.rows.cash'), cost: t('board.rows.cost'), revenue: t('board.rows.revenue') }}
          months={[
            {
              id: 'jan',
              label: t('board.months.jan'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashJan') },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'feb',
              label: t('board.months.feb'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashFeb') },
                { row: 'cost', amount: t('board.amounts.cost') },
                { row: 'revenue', amount: t('board.amounts.revenue'), movedFrom: 'apr', target: 'revenue-note' },
              ],
            },
            {
              id: 'mar',
              label: t('board.months.mar'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashMar') },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
            {
              id: 'apr',
              label: t('board.months.apr'),
              notes: [
                { row: 'cash', amount: t('board.amounts.cashApr') },
                { row: 'cost', amount: t('board.amounts.cost') },
              ],
            },
          ]}
          arrow={{ from: 'apr', to: 'feb', label: t('board.arrow') }}
        />
      </div>
    </SlideFrame>
  ),
});
