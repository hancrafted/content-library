import { Grid3x2 } from '@/components/episodes/slide-master/client/grid-3x2.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

// Six outlined cards in 3 rows × 2 columns on a dotted surface, Primer/Atlassian-style.
// The client widget runs a spotlight along each card's border that follows the pointer; static under reduced motion.
export const grid3x2 = slide({
  slug: 'grid-3x2',
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('grid')} className="mt-10">
        <Grid3x2
          copy={{
            c1: { title: t('cells.c1.title'), caption: t('cells.c1.caption') },
            c2: { title: t('cells.c2.title'), caption: t('cells.c2.caption') },
            c3: { title: t('cells.c3.title'), caption: t('cells.c3.caption') },
            c4: { title: t('cells.c4.title'), caption: t('cells.c4.caption') },
            c5: { title: t('cells.c5.title'), caption: t('cells.c5.caption') },
            c6: { title: t('cells.c6.title'), caption: t('cells.c6.caption') },
          }}
        />
      </div>
    </SlideFrame>
  ),
});
