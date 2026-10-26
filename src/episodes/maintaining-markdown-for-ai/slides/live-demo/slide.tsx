import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { LiveDemoCard } from './live-demo-card';

export const liveDemo = slide({
  slug: 'live-demo',
  messages: { en, de },
  notes: [
    { slug: 'demo-contrast', target: 'title' },
    { slug: 'holding-slide', target: 'terminal-panel' },
  ],
  segments: [{ slug: 'demo-walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <LiveDemoCard {...target('terminal-panel')} />
    </SlideFrame>
  ),
});
