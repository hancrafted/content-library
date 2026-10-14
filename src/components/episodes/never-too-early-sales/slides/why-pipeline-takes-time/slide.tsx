import { SectionSlide } from '@/components/slide-master/section-slide';
import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const whyPipelineTakesTime = slide({
  slug: 'why-pipeline-takes-time',
  messages: { en, de },
  segments: [{ slug: 'timing-needs-a-system' }, { slug: 'illustrations-are-not-forecasts' }],
  content: ({ t, Title }) => <SectionSlide title={<Title>{t('title')}</Title>} />,
});
