import { SectionSlide } from '@/episodes/components/slide-master/section-slide';
import { slide } from '@/episodes/components/slide-master/slide';
import { SlideProse } from '@/episodes/components/slide-master/slide-master';
import { EffortVenn } from '@/episodes/components/slide-shared/effort-venn';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const steeringTheAi = slide({
  slug: 'steering-the-ai',
  messages: { en, de },
  notes: [
    { slug: 'raising-the-floor', target: 'title' },
    { slug: 'tool-boundary', target: 'venn' },
  ],
  segments: [{ slug: 'raising-the-floor' }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <EffortVenn {...target('venn')} emphasis="machine" className="mt-4" />
    </SectionSlide>
  ),
});
