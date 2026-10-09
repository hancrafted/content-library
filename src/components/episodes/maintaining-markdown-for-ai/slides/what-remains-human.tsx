import { HumanJudgmentCard } from '@/components/episodes/maintaining-markdown-for-ai/workflow-passes';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const whatRemainsHuman = slide({
  slug: 'what-remains-human',
  notes: [
    { slug: 'ground-truth', target: 'title' },
    { slug: 'accountability', target: 'judgment-card' },
  ],
  segments: [{ slug: 'accountability-ground-truth' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <HumanJudgmentCard {...target('judgment-card')} />
    </SlideFrame>
  ),
});
