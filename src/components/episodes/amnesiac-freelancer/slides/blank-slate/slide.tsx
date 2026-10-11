import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The first Section's own slide: its Translation files name the Section. */
export const blankSlate = slide({
  slug: 'blank-slate',
  messages: { en, de },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
