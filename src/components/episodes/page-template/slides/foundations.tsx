import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('page-template');

/** The first Section's own slide: its Translation subtree names the Section. */
export const foundations = slide({
  slug: 'foundations',
  minutes: { en: 1, de: 1 },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
