import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const salesBeyondSelling = slide({
  slug: 'sales-beyond-selling',
  messages: { en, de },
  segments: [{ slug: 'use-the-lead-time' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
