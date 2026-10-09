import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('amnesiac-freelancer');

/** The first Section's own slide: its Translation subtree names the Section. */
export const blankSlate = slide({
  slug: 'blank-slate',
  minutes: { en: 1, de: 1 },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
