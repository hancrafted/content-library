import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DealBoard } from '@/episodes/components/slide-shared/deal-board/deal-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10 justify-end">
        <div className="rounded-xl border bg-card px-2 pt-4 pb-2 shadow-md md:px-4">
          <DealBoard
            label={t('board')}
            locale={locale}
            wrap
            lanes={[
              {
                slug: 'leads',
                label: t('lanes.leads'),
                deals: [{ slug: 'first-lead', tag: t('firstLead.tag'), company: t('firstLead.text'), ringed: true }],
              },
              { slug: 'opportunities', label: t('lanes.opportunities'), deals: [], slot: { kind: 'open' } },
              { slug: 'closing', label: t('lanes.closing'), deals: [], slot: { kind: 'open' } },
              { slug: 'payment', label: t('lanes.payment'), deals: [], slot: { kind: 'payment', text: t('tooLate') } },
            ]}
          />
        </div>
      </SlideFrame>
    </>
  ),
});
