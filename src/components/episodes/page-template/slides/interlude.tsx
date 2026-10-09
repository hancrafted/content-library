import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('page-template');

/** A Section of one Slide: its own slide, with no page Slides after it. */
export const interlude = slide({
  slug: 'interlude',
  minutes: { en: 1, de: 1 },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
