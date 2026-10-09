import { EffortVenn } from '@/components/episodes/maintaining-markdown-for-ai/effort-venn';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const whereTheEffortGoes = slide({
  slug: 'where-the-effort-goes',
  minutes: { en: 1, de: 1 },
  notes: [
    { slug: 'three-boundaries', target: 'title' },
    { slug: 'division-of-labour', target: 'venn' },
  ],
  segments: [{ slug: 'three-boundaries', from: 0.0, to: 0.75, bridge: true }],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <EffortVenn {...target('venn')} emphasis="establish" className="mt-4" />
    </SectionSlide>
  ),
});
