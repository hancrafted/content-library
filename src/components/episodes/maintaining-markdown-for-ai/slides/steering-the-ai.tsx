import { EffortVenn } from '@/components/episodes/maintaining-markdown-for-ai/effort-venn';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const steeringTheAi = slide({
  slug: 'steering-the-ai',
  minutes: { en: 1, de: 1 },
  notes: [
    { slug: 'raising-the-floor', target: 'title' },
    { slug: 'tool-boundary', target: 'venn' },
  ],
  segments: [{ slug: 'raising-the-floor', from: 0.0, to: 0.85 }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <EffortVenn {...target('venn')} emphasis="machine" className="mt-4" />
    </SectionSlide>
  ),
});
