import { LiveDemoCard } from '@/components/episodes/maintaining-markdown-for-ai/live-demo-card';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';

const slide = slidesFor('maintaining-markdown-for-ai');

export const liveDemo = slide({
  slug: 'live-demo',
  minutes: { en: 3, de: 4 },
  notes: [
    { slug: 'demo-contrast', target: 'title' },
    { slug: 'holding-slide', target: 'terminal-panel' },
  ],
  segments: [{ slug: 'demo-walkthrough', from: 0.0, to: 3.5 }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <LiveDemoCard {...target('terminal-panel')} />
    </SlideFrame>
  ),
});
