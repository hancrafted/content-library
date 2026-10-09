import { AiRecommendationCard } from '@/components/episodes/maintaining-markdown-for-ai/workflow-passes';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const whatAiAccelerates = slide({
  slug: 'what-ai-accelerates',
  notes: [
    { slug: 'cross-referencing', target: 'title' },
    { slug: 'signals-not-resolutions', target: 'discrepancy-card' },
  ],
  segments: [{ slug: 'signals-and-contradictions' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <AiRecommendationCard {...target('discrepancy-card')} />
    </SlideFrame>
  ),
});
