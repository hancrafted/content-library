import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The third Section's own slide: it names the Section, so no visual and no motion.
export const howToStartDoingSales = slide({
  slug: 'how-to-start-doing-sales',
  messages: { en, de },
  segments: [{ slug: 'from-idea-to-practice' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
