import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('slide-master');

// Placeholder: the Slide sub-agent replaces the Scene below; slug, note and segment stay.
export const grid2x1 = slide({
  slug: 'grid-2x1',
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div {...target('grid')} className="mt-10 min-h-64 rounded-xl border border-dashed" />
    </SlideFrame>
  ),
});
