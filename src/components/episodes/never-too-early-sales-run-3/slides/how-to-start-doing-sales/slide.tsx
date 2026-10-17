import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DealEcho } from '@/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "How to start doing sales": the Hero motif's board filling, four leads in the ringed first
// lane and two moved on, the payment lane still a dashed slot.
export const howToStartDoingSales = slide({
  slug: 'how-to-start-doing-sales',
  messages: { en, de },
  segments: [{ slug: 'backward-chaining' }, { slug: 'the-claim' }, { slug: 'signposting' }],
  content: () => (
    <SlideFrame>
      <DealEcho
        lanes={[
          {
            slug: 'leads',
            ringed: true,
            notes: [{ slug: 'lead-1' }, { slug: 'lead-2' }, { slug: 'lead-3' }, { slug: 'lead-4' }],
          },
          { slug: 'opportunities', notes: [{ slug: 'opportunity-1' }, { slug: 'opportunity-2' }] },
          { slug: 'closing' },
          { slug: 'payment', slot: { kind: 'payment' } },
        ]}
      />
    </SlideFrame>
  ),
});
