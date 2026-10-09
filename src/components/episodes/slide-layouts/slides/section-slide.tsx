import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('slide-layouts');

// Section slide: first in its Section, so it names the Section in the table of contents.
export const sectionSlide = slide({
  slug: 'section-slide',
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
