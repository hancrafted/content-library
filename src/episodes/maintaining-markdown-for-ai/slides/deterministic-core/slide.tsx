import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { HarnessFlow } from './harness-flow';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const deterministicCore = slide({
  slug: 'deterministic-core',
  messages: { en, de },
  notes: [
    { slug: 'three-triggers', target: 'title' },
    { slug: 'predictable-eval', target: 'flow-diagram' },
  ],
  segments: [{ slug: 'three-triggers', bridge: true }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <HarnessFlow {...target('flow-diagram')} />
    </SlideFrame>
  ),
});
