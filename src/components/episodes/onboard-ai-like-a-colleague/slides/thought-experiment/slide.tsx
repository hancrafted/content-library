import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The thought experiment": the kit's section layout, a title and caption, no custom visual.
export const thoughtExperiment = slide({
  slug: 'thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'you-are-in-it' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
