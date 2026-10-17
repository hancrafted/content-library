import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { DealBoard } from '@/components/slide-shared/deal-board/deal-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: an empty deal board under the Episode's `h1`
 * and caption. One lead stands ringed in the first lane, the middle lanes hold empty dashed slots, and the payment
 * lane waits on a dashed "too late?" note. Each section slide echoes this board, filled a step further. The empty
 * Backdrop is the Title slide's one Backdrop, holding no glow.
 */
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
            emphasis="leads"
            incoming={[{ slug: 'first-lead', tag: t('firstLead.tag'), text: t('firstLead.text') }]}
            lanes={[
              { slug: 'leads', label: t('lanes.leads'), deals: [] },
              { slug: 'opportunities', label: t('lanes.opportunities'), deals: [], slot: {} },
              { slug: 'closing', label: t('lanes.closing'), deals: [], slot: {} },
              {
                slug: 'payment',
                label: t('lanes.payment'),
                deals: [],
                slot: { text: t('tooLate'), tone: 'success' },
              },
            ]}
          />
        </div>
      </SlideFrame>
    </>
  ),
});
