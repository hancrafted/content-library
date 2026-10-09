import { MachineCheckCard } from '@/components/episodes/maintaining-markdown-for-ai/workflow-passes';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const whatTheMachineVerifies = slide({
  slug: 'what-the-machine-verifies',
  notes: [
    { slug: 'deterministic-checks', target: 'title' },
    { slug: 'mechanical-ceiling', target: 'check-result' },
  ],
  segments: [{ slug: 'mechanical-ceiling' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <MachineCheckCard {...target('check-result')} />
    </SlideFrame>
  ),
});
