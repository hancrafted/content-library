import { RoadmapTable } from '@/components/episodes/maintaining-markdown-for-ai/roadmap-table';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const featureRoadmap = slide({
  slug: 'feature-roadmap',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'v0-0-4-scope', target: 'shipped-col' },
    { slug: 'future-checks', target: 'planned-col' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <RoadmapTable shipped={target('shipped-col')} planned={target('planned-col')} />
    </SlideFrame>
  ),
});
