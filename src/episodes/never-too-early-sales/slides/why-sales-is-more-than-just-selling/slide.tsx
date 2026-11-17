import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DealEcho } from '@/episodes/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whySalesIsMoreThanJustSelling = slide({
  slug: 'why-sales-is-more-than-just-selling',
  messages: { en, de },
  segments: [{ slug: 'pain-first' }, { slug: 'the-claim' }],
  content: ({ t }) => (
    <SlideFrame>
      <DealEcho
        lanes={[
          { slug: 'leads', notes: [{ slug: 'insight', text: t('payouts.insight') }] },
          { slug: 'opportunities', notes: [{ slug: 'trust', text: t('payouts.trust') }] },
          { slug: 'closing', notes: [{ slug: 'process', text: t('payouts.process') }] },
          { slug: 'payment', slot: { kind: 'payment' } },
        ]}
      />
    </SlideFrame>
  ),
});
