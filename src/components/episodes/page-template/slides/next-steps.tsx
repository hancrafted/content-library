import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('page-template');

export const nextSteps = slide({
  slug: 'next-steps',
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
