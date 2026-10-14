import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The second Section's own slide: a quiet beat before the planning board, so no motion here.
export const whySalesIsMoreThanJustSelling = slide({
  slug: 'why-sales-is-more-than-just-selling',
  messages: { en, de },
  segments: [{ slug: 'second-reason' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
