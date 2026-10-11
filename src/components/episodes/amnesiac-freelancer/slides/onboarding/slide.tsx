import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The Section holds three page Slides, and its caption counts them. */
const PAGE_SLIDES = 3;

export const onboarding = slide({
  slug: 'onboarding',
  messages: { en, de },
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption', { count: PAGE_SLIDES })} />
  ),
});
