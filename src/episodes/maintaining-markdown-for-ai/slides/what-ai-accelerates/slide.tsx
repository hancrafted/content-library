import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiRecommendationCard } from './ai-recommendation-card';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whatAiAccelerates = slide({
  slug: 'what-ai-accelerates',
  messages: { en, de },
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
