import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('page-template');

// A Section's first Slide is its section slide: its `title` in the Translation file names the Section.
export const foundations = slide({
  slug: 'foundations',
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
