import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whyCashflowMatters = slide({
  slug: 'why-cashflow-matters',
  messages: { en, de },
  segments: [{ slug: 'a-good-deal-a-bad-date' }, { slug: 'work-backwards-from-cash' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
