import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The first Section's own slide: a pause before the cashflow board's first entrance, so no motion here.
export const whyWatchingCashflowIsMissionCritical = slide({
  slug: 'why-watching-cashflow-is-mission-critical',
  messages: { en, de },
  segments: [{ slug: 'opening-promise' }, { slug: 'who-this-is-for' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
