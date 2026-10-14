import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why building an effective sales pipeline takes time": the kit's section layout as is, no
// caption, no Visual, no motion.
export const whyBuildingAnEffectiveSalesPipelineTakesTime = slide({
  slug: 'why-building-an-effective-sales-pipeline-takes-time',
  messages: { en, de },
  segments: [{ slug: 'not-a-switch' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
