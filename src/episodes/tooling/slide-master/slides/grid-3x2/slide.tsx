import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Grid3x2 } from './grid-3x2.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Six outlined cards in 3 rows × 2 columns on a dotted surface, Primer/Atlassian-style.
// The client widget runs a spotlight along each card's border that follows the pointer; static under reduced motion.
export const grid3x2 = slide({
  slug: 'grid-3x2',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target }) => (
    <SlideFrame>
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
