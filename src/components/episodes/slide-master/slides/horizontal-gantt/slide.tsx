import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { HorizontalGantt } from './horizontal-gantt.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Timeline as a roadmap: three lanes of phase bars on a quarter axis, a "today" line through them. Hover or
// focus opens a bar's caption.
export const horizontalGantt = slide({
  slug: 'horizontal-gantt',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target }) => (
    <SlideFrame>
      <div {...target('timeline')} className="mt-12 md:my-auto md:py-12">
        <HorizontalGantt
          label={t('title')}
          lanes={{ a: t('lanes.a'), b: t('lanes.b'), c: t('lanes.c') }}
          items={{
            a: { date: t('items.a.date'), title: t('items.a.title'), caption: t('items.a.caption') },
            b: { date: t('items.b.date'), title: t('items.b.title'), caption: t('items.b.caption') },
            c: { date: t('items.c.date'), title: t('items.c.title'), caption: t('items.c.caption') },
            d: { date: t('items.d.date'), title: t('items.d.title'), caption: t('items.d.caption') },
            e: { date: t('items.e.date'), title: t('items.e.title'), caption: t('items.e.caption') },
            f: { date: t('items.f.date'), title: t('items.f.title'), caption: t('items.f.caption') },
          }}
        />
      </div>
    </SlideFrame>
  ),
});
