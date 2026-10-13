import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your move": the kit's section layout, a title and caption, no custom visual.
export const yourMove = slide({
  slug: 'your-move',
  messages: { en, de },
  segments: [{ slug: 'habit-and-twist' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
