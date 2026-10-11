import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RoadmapTable } from './roadmap-table';

export const featureRoadmap = slide({
  slug: 'feature-roadmap',
  messages: { en, de },
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
