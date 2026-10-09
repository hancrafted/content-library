import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('page-template');

/** How many page Slides follow in this Section; the caption's ICU plural reads it. */
const PAGE_SLIDES = 2;

export const nextSteps = slide({
  slug: 'next-steps',
  minutes: { en: 1, de: 1 },
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption', { count: PAGE_SLIDES })} />
  ),
});
