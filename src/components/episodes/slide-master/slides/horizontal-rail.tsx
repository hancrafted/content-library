import { HorizontalRail } from '@/components/episodes/slide-master/client/horizontal-rail.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

export const horizontalRail = slide({
  slug: 'horizontal-rail',
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('timeline')} className="mt-12 md:my-auto md:py-12">
        <HorizontalRail
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
