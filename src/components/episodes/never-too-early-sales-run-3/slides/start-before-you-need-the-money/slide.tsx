import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DealEcho } from '@/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Start before you need the money": the Hero motif's board full, and the revenue note landed
// in the ringed payment lane.
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
