import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DealEcho } from '@/episodes/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const startBeforeYouNeedTheMoney = slide({
  slug: 'start-before-you-need-the-money',
  messages: { en, de },
  segments: [{ slug: 'back-to-the-wall' }, { slug: 'peak-end-close' }],
  content: () => (
    <SlideFrame>
      <DealEcho
        lanes={[
          { slug: 'leads', notes: [{ slug: 'lead-1' }, { slug: 'lead-2' }] },
          { slug: 'opportunities', notes: [{ slug: 'opportunity-1' }] },
          { slug: 'closing', notes: [{ slug: 'deal-1' }] },
          { slug: 'payment', ringed: true, notes: [{ slug: 'revenue', tint: 'revenue' }] },
        ]}
      />
    </SlideFrame>
  ),
});
