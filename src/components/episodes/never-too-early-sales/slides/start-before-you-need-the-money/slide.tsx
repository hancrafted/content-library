import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The last Section's own slide: the quiet beat before the board's final return, so no motion here.
export const startBeforeYouNeedTheMoney = slide({
  slug: 'start-before-you-need-the-money',
  messages: { en, de },
  segments: [{ slug: 'landing-it' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
