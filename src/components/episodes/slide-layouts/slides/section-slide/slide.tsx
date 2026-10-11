import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// Section slide: first in its Section, so it names the Section in the table of contents.
export const sectionSlide = slide({
  slug: 'section-slide',
  messages: { en, de },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
