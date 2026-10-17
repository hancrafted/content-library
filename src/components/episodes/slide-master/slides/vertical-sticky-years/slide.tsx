import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { StickyYears } from './vertical-sticky-years';

// Timeline as a changelog: each year pins on the left while its entries scroll past on the right. Pinning is CSS
// sticky and the reading-line highlight CSS scroll-driven, so the Scene needs no client widget.
export const verticalStickyYears = slide({
  slug: 'vertical-sticky-years',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target }) => (
    <SlideFrame>
      <div {...target('timeline')} className="mt-12">
        <StickyYears
          label={t('title')}
          entries={[
            { date: t('items.a.date'), title: t('items.a.title'), caption: t('items.a.caption') },
            { date: t('items.b.date'), title: t('items.b.title'), caption: t('items.b.caption') },
            { date: t('items.c.date'), title: t('items.c.title'), caption: t('items.c.caption') },
            { date: t('items.d.date'), title: t('items.d.title'), caption: t('items.d.caption') },
            { date: t('items.e.date'), title: t('items.e.title'), caption: t('items.e.caption') },
            { date: t('items.f.date'), title: t('items.f.title'), caption: t('items.f.caption') },
          ]}
        />
      </div>
    </SlideFrame>
  ),
});
