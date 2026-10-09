import { HarnessFlow } from '@/components/episodes/maintaining-markdown-for-ai/harness-flow';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const deterministicCore = slide({
  slug: 'deterministic-core',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'three-triggers', target: 'title' },
    { slug: 'predictable-eval', target: 'flow-diagram' },
  ],
  segments: [{ slug: 'three-triggers', from: 0.0, to: 0.85, bridge: true }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <HarnessFlow {...target('flow-diagram')} />
    </SlideFrame>
  ),
});
