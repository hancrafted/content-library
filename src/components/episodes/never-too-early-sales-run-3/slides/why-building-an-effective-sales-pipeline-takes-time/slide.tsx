import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { DealEcho } from '@/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why building an effective sales pipeline takes time": the Hero motif's board counted, 27
// leads, 3 opportunities and the ringed 1 deal, over a bracket reading the cycle; the payment lane still a dashed slot.
export const whyBuildingAnEffectiveSalesPipelineTakesTime = slide({
  slug: 'why-building-an-effective-sales-pipeline-takes-time',
  messages: { en, de },
  segments: [{ slug: 'the-obvious-objection' }, { slug: 'the-claim' }],
  content: ({ t }) => (
    <SlideFrame className="mt-6 pb-12! md:pb-16!">
      <DealEcho
        lanes={[
          { slug: 'leads', count: t('counts.leads') },
          { slug: 'opportunities', count: t('counts.opportunities') },
          { slug: 'closing', ringed: true, count: t('counts.closing') },
          { slug: 'payment', slot: true },
        ]}
        cycle={t('cycle')}
      />
    </SlideFrame>
  ),
});
