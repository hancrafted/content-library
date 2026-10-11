import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MachineCheckCard } from './machine-check-card';

export const whatTheMachineVerifies = slide({
  slug: 'what-the-machine-verifies',
  messages: { en, de },
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
