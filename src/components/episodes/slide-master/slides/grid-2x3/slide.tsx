import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Grid2x3 } from './grid-2x3.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Six filled tonal cards in 2 rows × 3 columns, M3-style: icon chip over title and caption, gap equal to padding.
// The client widget stagger-fades the cells in once when the Slide becomes active and lifts a card on hover.
export const grid2x3 = slide({
  slug: 'grid-2x3',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('grid')} className="mt-10">
        <Grid2x3
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
