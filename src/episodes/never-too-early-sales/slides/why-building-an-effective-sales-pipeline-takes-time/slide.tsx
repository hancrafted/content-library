import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DealEcho } from '@/episodes/components/slide-shared/deal-board/deal-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

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
