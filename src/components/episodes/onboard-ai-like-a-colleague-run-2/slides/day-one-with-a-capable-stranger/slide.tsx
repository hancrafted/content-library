import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Day one with a capable stranger": the kit's section layout as is, no caption, no Visual, no motion.
export const dayOneWithACapableStranger = slide({
  slug: 'day-one-with-a-capable-stranger',
  messages: { en, de },
  segments: [{ slug: 'switch-to-the-room' }, { slug: 'a-real-task' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
