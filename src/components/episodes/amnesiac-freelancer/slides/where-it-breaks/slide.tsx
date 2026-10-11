import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whereItBreaks = slide({
  slug: 'where-it-breaks',
  messages: { en, de },
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
