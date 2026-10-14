import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A turn in the talk: no motion here, the three Slides after it carry it.
export const whyBuildingAnEffectiveSalesPipelineTakesTime = slide({
  slug: 'why-building-an-effective-sales-pipeline-takes-time',
  messages: { en, de },
  notes: [],
  segments: [{ slug: 'why-not-start-later' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')} />,
});
