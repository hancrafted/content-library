import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "How to start doing sales": the kit's section layout as is, its caption the Voice script's own
// question, no Visual, no motion.
export const howToStartDoingSales = slide({
  slug: 'how-to-start-doing-sales',
  messages: { en, de },
  segments: [{ slug: 'from-idea-to-first-step' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
