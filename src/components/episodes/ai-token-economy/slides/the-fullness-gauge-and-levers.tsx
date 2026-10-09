import { ContextGaugeSliderClient } from '@/components/episodes/ai-token-economy/client/context-gauge-slider.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('ai-token-economy');

export const theFullnessGaugeAndLevers = slide({
  slug: 'the-fullness-gauge-and-levers',
  notes: [{ slug: 'smart-zone-discipline', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8">
        <ContextGaugeSliderClient />
      </div>
    </SlideFrame>
  ),
});
