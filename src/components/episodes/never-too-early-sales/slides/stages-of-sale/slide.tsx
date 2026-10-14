import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { StageFlow } from './stage-flow';

// A Scene, not ThreeColumnSlide: the stages need arrows between them, a wider Opportunities column and a trailing delivery arrow.
export const stagesOfSale = slide({
  slug: 'stages-of-sale',
  messages: { en, de },
  notes: [
    {
      slug: 'delivery-adds-lag',
      target: 'delivery',
      sources: [
        {
          slug: 'eu-late-payment-directive',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007',
        },
      ],
    },
    {
      slug: 'early-channels-do-not-scale',
      target: 'first-contact',
      sources: [
        {
          slug: 'roberge-science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
  ],
  segments: [
    { slug: 'three-stages' },
    { slug: 'leads' },
    { slug: 'first-contact' },
    { slug: 'opportunities' },
    { slug: 'after-closing' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto pt-10">
        <StageFlow
          label={t('flow.label')}
          stages={[
            {
              slug: 'leads',
              title: t('stages.leads.title'),
              notes: [
                { slug: 'research', text: t('stages.leads.notes.research') },
                {
                  slug: 'first-contact',
                  text: t('stages.leads.notes.first-contact'),
                  detail: t('stages.leads.notes.first-contact-detail'),
                  target: target('first-contact'),
                },
              ],
            },
            {
              slug: 'opportunities',
              title: t('stages.opportunities.title'),
              tag: t('stages.opportunities.tag'),
              notes: [
                { slug: 'conversations', text: t('stages.opportunities.notes.conversations') },
                { slug: 'questions', text: t('stages.opportunities.notes.questions') },
                { slug: 'proposal', text: t('stages.opportunities.notes.proposal') },
              ],
            },
            {
              slug: 'closing',
              title: t('stages.closing.title'),
              notes: [{ slug: 'signature', text: t('stages.closing.notes.signature') }],
            },
          ]}
          delivery={{ label: t('delivery.label'), cash: t('delivery.cash'), target: target('delivery') }}
        />
      </div>
    </SlideFrame>
  ),
});
