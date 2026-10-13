import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Four disciplines, one line each": the kit's section layout as is, no caption, no Visual, no motion.
export const fourDisciplinesOneLineEach = slide({
  slug: 'four-disciplines-one-line-each',
  messages: { en, de },
  segments: [{ slug: 'names-not-a-map' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
