import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The gap": the kit's section layout, a title and caption, no custom visual.
export const theGap = slide({
  slug: 'the-gap',
  messages: { en, de },
  segments: [{ slug: 'promise-and-your-day' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
