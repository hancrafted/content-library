import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why sales is more than just selling": the kit's section layout as is, no caption, no motion.
export const whySalesIsMoreThanJustSelling = slide({
  slug: 'why-sales-is-more-than-just-selling',
  messages: { en, de },
  segments: [{ slug: 'pain-first' }, { slug: 'the-claim' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
