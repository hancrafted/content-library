import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DealEcho } from '@/episodes/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why building an effective sales pipeline takes time": the Hero motif's board counted, 27
// leads, 3 opportunities and the 1 deal in `primary`, over a bracket reading the cycle; the payment lane still a
// dashed slot.
export const whyBuildingAnEffectiveSalesPipelineTakesTime = slide({
  slug: 'why-building-an-effective-sales-pipeline-takes-time',
  messages: { en, de },
  segments: [{ slug: 'the-obvious-objection' }, { slug: 'the-claim' }],
  content: ({ t }) => (
    <SlideFrame>
      <DealEcho
        lanes={[
          { slug: 'leads', count: { value: t('counts.leads') } },
          { slug: 'opportunities', count: { value: t('counts.opportunities') } },
          { slug: 'closing', count: { value: t('counts.closing'), primary: true } },
          { slug: 'payment', slot: { kind: 'payment' } },
        ]}
        cycle={t('cycle')}
      />
    </SlideFrame>
  ),
});
