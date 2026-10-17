import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RadialCycle } from './radial-cycle.client';

export const radialCycle = slide({
  slug: 'radial-cycle',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target }) => (
    <SlideFrame>
      <div {...target('timeline')} className="mt-10 md:my-auto md:py-8">
        <RadialCycle
          label={t('title')}
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
