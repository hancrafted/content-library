import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Start before you need the money": the kit's section layout as is, no caption, no motion.
export const startBeforeYouNeedTheMoney = slide({
  slug: 'start-before-you-need-the-money',
  messages: { en, de },
  segments: [{ slug: 'back-to-the-wall' }, { slug: 'peak-end-close' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
