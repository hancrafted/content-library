import { AiRecommendationCard } from '@/components/episodes/maintaining-markdown-for-ai/workflow-passes';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const whatAiAccelerates = slide({
  slug: 'what-ai-accelerates',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'cross-referencing', target: 'title' },
    { slug: 'signals-not-resolutions', target: 'discrepancy-card' },
  ],
  segments: [{ slug: 'signals-and-contradictions', from: 0.0, to: 0.85 }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <AiRecommendationCard {...target('discrepancy-card')} />
    </SlideFrame>
  ),
});
