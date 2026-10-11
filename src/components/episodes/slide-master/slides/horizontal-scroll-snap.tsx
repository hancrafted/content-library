import { HorizontalScrollSnap } from '@/components/episodes/slide-master/client/horizontal-scroll-snap.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

// Timeline as a horizontal story: a snapping track of tall cards wider than the Slide, with a progress bar and
// previous/next below. Scroll and snap are native CSS; the widget only follows the position.
export const horizontalScrollSnap = slide({
  slug: 'horizontal-scroll-snap',
  notes: [{ slug: 'layout', target: 'timeline' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('timeline')} className="mt-10">
        <HorizontalScrollSnap
          label={t('title')}
          cards={[
            { date: t('items.a.date'), title: t('items.a.title'), caption: t('items.a.caption') },
            { date: t('items.b.date'), title: t('items.b.title'), caption: t('items.b.caption') },
            { date: t('items.c.date'), title: t('items.c.title'), caption: t('items.c.caption') },
            { date: t('items.d.date'), title: t('items.d.title'), caption: t('items.d.caption') },
            { date: t('items.e.date'), title: t('items.e.title'), caption: t('items.e.caption') },
            { date: t('items.f.date'), title: t('items.f.title'), caption: t('items.f.caption') },
          ]}
          controls={{ previous: t('controls.previous'), next: t('controls.next') }}
        />
      </div>
    </SlideFrame>
  ),
});
