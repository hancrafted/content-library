import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';

const slide = slidesFor('amnesiac-freelancer');

/** The Section holds three page Slides, and its caption counts them. */
const PAGE_SLIDES = 3;

export const onboarding = slide({
  slug: 'onboarding',
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption', { count: PAGE_SLIDES })} />
  ),
});
