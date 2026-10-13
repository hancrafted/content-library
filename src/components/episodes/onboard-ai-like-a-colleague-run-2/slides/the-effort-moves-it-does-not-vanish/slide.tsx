import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The effort moves, it does not vanish": the kit's section layout as is, no caption, no Visual, no motion.
export const theEffortMovesItDoesNotVanish = slide({
  slug: 'the-effort-moves-it-does-not-vanish',
  messages: { en, de },
  segments: [{ slug: 'where-did-the-time-go' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
