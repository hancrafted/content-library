import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { formatEuro } from '@/episodes/components/slide-shared/cashflow-board/cashflow-board.pure';
import { DealEcho } from '@/episodes/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why watching cashflow is mission critical": the Hero motif's board, still empty, its payment
// lane ringed on a cash note reading €0.
export const whyWatchingCashflowIsMissionCritical = slide({
  slug: 'why-watching-cashflow-is-mission-critical',
  messages: { en, de },
  segments: [{ slug: 'imagine-the-wall' }, { slug: 'cash-decides-how-long-you-have' }, { slug: 'the-route' }],
  content: ({ locale }) => (
    <SlideFrame>
      <DealEcho
        lanes={[
          { slug: 'leads' },
          { slug: 'opportunities' },
          { slug: 'closing' },
          { slug: 'payment', ringed: true, notes: [{ slug: 'cash', text: formatEuro(0, locale), tint: 'cash' }] },
        ]}
      />
    </SlideFrame>
  ),
});
