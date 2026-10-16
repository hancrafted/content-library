import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why watching cashflow is mission critical": the kit's section layout as is, no caption, no motion.
export const whyWatchingCashflowIsMissionCritical = slide({
  slug: 'why-watching-cashflow-is-mission-critical',
  messages: { en, de },
  segments: [{ slug: 'imagine-the-wall' }, { slug: 'cash-decides-how-long-you-have' }, { slug: 'the-route' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
