import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import { ContextGaugeSliderClient } from './context-gauge-slider.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const theFullnessGaugeAndLevers = slide({
  slug: 'the-fullness-gauge-and-levers',
  messages: { en, de },
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
