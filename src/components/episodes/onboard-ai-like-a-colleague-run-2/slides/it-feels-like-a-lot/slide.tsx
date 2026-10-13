import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "It feels like a lot": the kit's section layout as is, no caption, no Visual, no motion.
export const itFeelsLikeALot = slide({
  slug: 'it-feels-like-a-lot',
  messages: { en, de },
  segments: [{ slug: 'it-feels-like-a-lot' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
